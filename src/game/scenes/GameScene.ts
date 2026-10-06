import Phaser from "phaser";
import {
  GUARD_START,
  GRID_HEIGHT,
  GRID_WIDTH,
  LAB_MAP,
  PATROL_POINTS,
  PLAYER_START,
  TILE_SIZE,
} from "../../application/simulation/labLevel";
import { calculateRoute } from "../../application/simulation/navigationDemo";
import {
  firstStepDirection,
  planPatrolLeg,
  type PatrolLeg,
} from "../../application/simulation/patrolSimulation";
import {
  initialPerceptionState,
  updatePerceptionSimulation,
  withSoundEvent,
  type PerceptionSimulationState,
} from "../../application/simulation/perceptionSimulation";
import {
  IMPACT_FLASH_MS,
  IMPACT_MARK_MS,
  IMPACT_SHAKE_MS,
  shouldTriggerAlertImpact,
} from "../../domain/behavior/alertImpact";
import {
  ALERT_MAX,
  initialAlertMeter,
  updateAlertMeter,
  type AlertLevel,
  type AlertMeterState,
} from "../../domain/behavior/alertMeter";
import {
  canThrowDistraction,
  distractionCooldownRemaining,
  distractionLanding,
  startInvestigation,
  updateInvestigation,
  type InvestigationState,
} from "../../domain/behavior/distraction";
import {
  initialPatrolState,
  resumePatrol,
  updatePatrol,
  withPatrolTarget,
  type PatrolState,
} from "../../domain/behavior/patrol";
import { cellCenter, isWalkable, worldToCell, type GridPoint } from "../../domain/model/grid";
import type { Vector2 } from "../../domain/model/vector";
import { advanceAlongPath } from "../../domain/navigation/pathFollower";
import type { SearchAlgorithm, SearchResult, SearchStatus } from "../../domain/navigation/search";
import { timeSinceLastPerception } from "../../domain/perception/memory";
import type { VisionReason, VisionResult } from "../../domain/perception/perception";
import { visionConeOutline } from "../../domain/perception/visionCone";
import {
  formatTelemetryEvent,
  telemetryEvent,
  type TelemetryEvent,
} from "../../domain/telemetry/telemetry";

const PLAYER_SPEED = 190;
const GUARD_SPEED = 115;
const VISION_RANGE = 220;
const FIELD_OF_VIEW = Math.PI / 2;
const SOUND_RADIUS = 190;
const SOUND_DURATION_MS = 800;
const CONE_RAY_COUNT = 41;
const ALERT_BAR = { x: 272, y: 16, width: 180, height: 10 };
const TELEMETRY_LIMIT = 200;
const LEVEL_LABELS: Readonly<Record<AlertLevel, string>> = {
  calm: "TRANQUILO",
  suspicious: "SOSPECHA",
  alert: "ALERTA",
};
const LEVEL_COLORS: Readonly<Record<AlertLevel, number>> = {
  calm: 0x6b8afd,
  suspicious: 0xe5b454,
  alert: 0xe16969,
};
const STATUS_LABELS: Readonly<Record<SearchStatus, string>> = {
  success: "EXITO",
  unreachable: "INALCANZABLE",
  "invalid-start": "INICIO INVALIDO",
  "invalid-goal": "DESTINO INVALIDO",
};
const VISION_LABELS: Readonly<Record<VisionReason, string>> = {
  visible: "VISIBLE",
  "out-of-range": "FUERA DE RANGO",
  "outside-cone": "FUERA DEL CONO",
  occluded: "OCLUIDO",
  "invalid-facing": "DIRECCION INVALIDA",
};

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private guard!: Phaser.GameObjects.Arc;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private moveUp!: Phaser.Input.Keyboard.Key;
  private moveDown!: Phaser.Input.Keyboard.Key;
  private moveLeft!: Phaser.Input.Keyboard.Key;
  private moveRight!: Phaser.Input.Keyboard.Key;
  private reset!: Phaser.Input.Keyboard.Key;
  private toggleAlgorithm!: Phaser.Input.Keyboard.Key;
  private emitSound!: Phaser.Input.Keyboard.Key;
  private togglePatrol!: Phaser.Input.Keyboard.Key;
  private throwDistraction!: Phaser.Input.Keyboard.Key;
  private alertGraphics!: Phaser.GameObjects.Graphics;
  private alertLabel!: Phaser.GameObjects.Text;
  private impactMarker!: Phaser.GameObjects.Text;
  private distractionMarker!: Phaser.GameObjects.Arc;
  private navigationGraphics!: Phaser.GameObjects.Graphics;
  private perceptionGraphics!: Phaser.GameObjects.Graphics;
  private targetMarker!: Phaser.GameObjects.Arc;
  private lastKnownMarker!: Phaser.GameObjects.Arc;
  private navigationHud!: Phaser.GameObjects.Text;
  private navigationAlgorithm: SearchAlgorithm = "astar";
  private navigationGoal: GridPoint = GUARD_START;
  private navigationSummary: readonly string[] = [];
  private guardFacing: Vector2 = { x: -1, y: 0 };
  private guardWaypoints: readonly Vector2[] = [];
  private nextWaypoint = 0;
  private perceptionState: PerceptionSimulationState = initialPerceptionState();
  private patrolState: PatrolState = initialPatrolState();
  private patrolEnabled = true;
  private patrolBlocked = false;
  private pendingPatrolLeg: PatrolLeg | null = null;
  private alertMeter: AlertMeterState = initialAlertMeter();
  private lastAlertUpdateMs: number | null = null;
  private impactCount = 0;
  private impactMarkerUntilMs = 0;
  private lastPlayerDirection: Vector2 = { x: 1, y: 0 };
  private lastThrowAtMs: number | null = null;
  private investigation: InvestigationState | null = null;
  private investigatedSoundAtMs: number | null = null;
  private soundUnreachable = false;
  private telemetry: TelemetryEvent[] = [];

  public constructor() {
    super("GameScene");
  }

  public create(): void {
    this.navigationAlgorithm = "astar";
    this.navigationGoal = GUARD_START;
    this.guardFacing = { x: -1, y: 0 };
    this.guardWaypoints = [];
    this.nextWaypoint = 0;
    this.perceptionState = initialPerceptionState();
    this.patrolState = initialPatrolState();
    this.patrolEnabled = true;
    this.patrolBlocked = false;
    this.pendingPatrolLeg = null;
    this.alertMeter = initialAlertMeter();
    this.lastAlertUpdateMs = null;
    this.impactCount = 0;
    this.impactMarkerUntilMs = 0;
    this.lastPlayerDirection = { x: 1, y: 0 };
    this.lastThrowAtMs = null;
    this.investigation = null;
    this.investigatedSoundAtMs = null;
    this.soundUnreachable = false;
    this.telemetry = [];
    // Exposes the structured events so a run can be inspected from the browser console.
    (window as unknown as { __telemetria?: TelemetryEvent[] }).__telemetria = this.telemetry;
    this.cameras.main.resetFX();
    this.cameras.main.setBackgroundColor("#10161c");
    this.drawGrid();

    const walls = this.physics.add.staticGroup();
    for (let y = 0; y < GRID_HEIGHT; y += 1) {
      for (let x = 0; x < GRID_WIDTH; x += 1) {
        if (!isWalkable(LAB_MAP, { x, y })) {
          const center = cellCenter({ x, y }, TILE_SIZE);
          const wall = this.add.rectangle(center.x, center.y, TILE_SIZE, TILE_SIZE, 0x27333d);
          wall.setStrokeStyle(1, 0x3a4c58);
          walls.add(wall);
        }
      }
    }

    const spawn = cellCenter(PLAYER_START, TILE_SIZE);
    this.player = this.add.rectangle(spawn.x, spawn.y, 20, 20, 0xe5b454);
    this.player.setStrokeStyle(2, 0xffd98a);
    this.player.setDepth(4);
    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, walls);

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }

    this.cursors = keyboard.createCursorKeys();
    this.moveUp = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.moveDown = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.moveLeft = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.moveRight = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.reset = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.toggleAlgorithm = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.emitSound = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.togglePatrol = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.throwDistraction = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.perceptionGraphics = this.add.graphics().setDepth(1);
    this.navigationGraphics = this.add.graphics().setDepth(2);
    const guardPosition = cellCenter(GUARD_START, TILE_SIZE);
    this.guard = this.add
      .circle(guardPosition.x, guardPosition.y, 11, 0x6b8afd)
      .setStrokeStyle(2, 0xb9c5ff)
      .setDepth(4);
    this.targetMarker = this.add
      .circle(0, 0, 10, 0x000000, 0)
      .setStrokeStyle(3, 0x73c991)
      .setDepth(5);
    this.lastKnownMarker = this.add
      .circle(0, 0, 7, 0x000000, 0)
      .setStrokeStyle(2, 0xe16969)
      .setDepth(5)
      .setVisible(false);

    this.add
      .text(16, 14, "H3 / PERCEPCION Y MOVIMIENTO", {
        color: "#9eb4c2",
        fontFamily: "monospace",
        fontSize: "14px",
      })
      .setDepth(10);

    this.navigationHud = this.add
      .text(GRID_WIDTH * TILE_SIZE - 16, 14, "", {
        align: "right",
        backgroundColor: "#10161ccc",
        color: "#d9e4ea",
        fontFamily: "monospace",
        fontSize: "13px",
        padding: { x: 8, y: 6 },
      })
      .setOrigin(1, 0)
      .setDepth(10);

    this.alertGraphics = this.add.graphics().setDepth(9);
    this.alertLabel = this.add
      .text(ALERT_BAR.x + ALERT_BAR.width + 10, ALERT_BAR.y - 3, "", {
        color: "#d9e4ea",
        fontFamily: "monospace",
        fontSize: "13px",
      })
      .setDepth(10);
    this.impactMarker = this.add
      .text(0, 0, "!", {
        color: "#ff6b6b",
        fontFamily: "monospace",
        fontSize: "30px",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 1)
      .setDepth(11)
      .setVisible(false);
    this.distractionMarker = this.add
      .circle(0, 0, 5, 0xe5b454)
      .setStrokeStyle(2, 0xffd98a)
      .setDepth(5)
      .setVisible(false);

    this.drawPatrolPoints();
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.startPatrolLeg();
    this.updatePerception(0);
    // The first real update must not count the time elapsed before this scene started.
    this.lastAlertUpdateMs = null;
  }

  public update(time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.reset)) {
      this.scene.restart();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.toggleAlgorithm)) {
      this.navigationAlgorithm = this.navigationAlgorithm === "astar" ? "bfs" : "astar";
      this.renderNavigation();
    }

    if (Phaser.Input.Keyboard.JustDown(this.emitSound)) {
      this.perceptionState = withSoundEvent(this.perceptionState, {
        position: { x: this.player.x, y: this.player.y },
        radius: SOUND_RADIUS,
        emittedAtMs: time,
        durationMs: SOUND_DURATION_MS,
      });
    }

    const horizontal = Number(this.cursors.right.isDown || this.moveRight.isDown)
      - Number(this.cursors.left.isDown || this.moveLeft.isDown);
    const vertical = Number(this.cursors.down.isDown || this.moveDown.isDown)
      - Number(this.cursors.up.isDown || this.moveUp.isDown);
    const velocity = new Phaser.Math.Vector2(horizontal, vertical);

    if (velocity.lengthSq() > 0) {
      this.lastPlayerDirection = { x: horizontal, y: vertical };
      velocity.normalize().scale(PLAYER_SPEED);
    }

    if (Phaser.Input.Keyboard.JustDown(this.throwDistraction)) {
      this.tryThrowDistraction(time);
    }

    if (Phaser.Input.Keyboard.JustDown(this.togglePatrol)) {
      this.setPatrolEnabled(!this.patrolEnabled);
    }

    this.playerBody.setVelocity(velocity.x, velocity.y);
    this.updateGuardInvestigation(time);
    this.updateGuardPatrol(time);
    this.updateGuardMovement(delta);
    this.updatePerception(time);
  }

  private drawGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1b252d, 1);

    for (let x = 0; x <= GRID_WIDTH; x += 1) {
      graphics.lineBetween(x * TILE_SIZE, 0, x * TILE_SIZE, GRID_HEIGHT * TILE_SIZE);
    }
    for (let y = 0; y <= GRID_HEIGHT; y += 1) {
      graphics.lineBetween(0, y * TILE_SIZE, GRID_WIDTH * TILE_SIZE, y * TILE_SIZE);
    }
  }

  private drawPatrolPoints(): void {
    PATROL_POINTS.forEach((point, index) => {
      const center = cellCenter(point, TILE_SIZE);
      this.add
        .rectangle(center.x, center.y, 14, 14, 0x000000, 0)
        .setStrokeStyle(1, 0x8d7ad6)
        .setAngle(45)
        .setDepth(3);
      this.add
        .text(center.x + 10, center.y - 18, `P${index + 1}`, {
          color: "#8d7ad6",
          fontFamily: "monospace",
          fontSize: "11px",
        })
        .setDepth(3);
    });
  }

  private setPatrolEnabled(enabled: boolean): void {
    this.patrolEnabled = enabled;
    this.record("patrulla", enabled ? "suspendida" : "activa", "tecla P",
      enabled ? "activa" : "suspendida", "decision del jugador");
    if (enabled && !this.investigation) {
      this.patrolState = resumePatrol(this.patrolState);
      this.startPatrolLeg();
    }
  }

  private record(
    subject: string,
    previous: string,
    event: string,
    next: string,
    cause: string,
  ): void {
    const entry = telemetryEvent(this.time.now, subject, previous, event, next, cause);
    this.telemetry.push(entry);
    if (this.telemetry.length > TELEMETRY_LIMIT) {
      this.telemetry.shift();
    }
    console.info(formatTelemetryEvent(entry));
  }

  private tryThrowDistraction(time: number): void {
    if (!canThrowDistraction(this.lastThrowAtMs, time)) {
      return;
    }
    const playerCell = worldToCell({ x: this.player.x, y: this.player.y }, TILE_SIZE);
    const landing = distractionLanding(LAB_MAP, playerCell, this.lastPlayerDirection);
    if (!landing) {
      return;
    }

    const position = cellCenter(landing, TILE_SIZE);
    this.lastThrowAtMs = time;
    this.distractionMarker.setPosition(position.x, position.y).setVisible(true);
    this.perceptionState = withSoundEvent(this.perceptionState, {
      position,
      radius: SOUND_RADIUS,
      emittedAtMs: time,
      durationMs: SOUND_DURATION_MS,
    });
    this.record("distractor", "listo", "tecla E", "recarga", `cae en ${landing.x},${landing.y}`);
  }

  private startSoundInvestigation(origin: Vector2, emittedAtMs: number): void {
    if (this.investigatedSoundAtMs === emittedAtMs) {
      return;
    }
    this.investigatedSoundAtMs = emittedAtMs;

    const guardCell = worldToCell({ x: this.guard.x, y: this.guard.y }, TILE_SIZE);
    const goal = worldToCell(origin, TILE_SIZE);
    const route = calculateRoute(LAB_MAP, guardCell, goal, this.navigationAlgorithm);
    this.soundUnreachable = route.status !== "success";
    if (this.soundUnreachable) {
      this.record("guardia", this.guardActivity(), "sonido oido", this.guardActivity(),
        `origen ${goal.x},${goal.y} inalcanzable`);
      return;
    }

    const previous = this.guardActivity();
    this.investigation = startInvestigation();
    this.pendingPatrolLeg = null;
    this.navigationGoal = goal;
    this.applyRoute(route);
    this.record("guardia", previous, "sonido oido", "INVESTIGA", `origen ${goal.x},${goal.y}`);
  }

  private updateGuardInvestigation(time: number): void {
    if (!this.investigation) {
      return;
    }

    const previous = this.investigation.phase;
    this.investigation = updateInvestigation(this.investigation, {
      arrived: this.nextWaypoint >= this.guardWaypoints.length,
      timeMs: time,
    });
    if (previous === "going" && this.investigation.phase === "looking") {
      this.record("guardia", "INVESTIGA", "llegada al origen", "MIRA", "ruta completada");
    }
    if (this.investigation.phase !== "done") {
      return;
    }

    this.investigation = null;
    this.distractionMarker.setVisible(false);
    if (this.patrolEnabled) {
      this.patrolState = resumePatrol(this.patrolState);
      this.startPatrolLeg();
    }
    this.record("guardia", "MIRA", "fin de la espera", this.guardActivity(), "1500 ms cumplidos");
  }

  private guardActivity(): string {
    if (this.investigation) {
      return this.investigation.phase === "looking" ? "MIRA" : "INVESTIGA";
    }
    return this.patrolEnabled ? "PATRULLA" : "MANUAL";
  }

  /** Plans and starts walking toward the pending patrol point from the guard's current cell. */
  private startPatrolLeg(): void {
    const leg = this.planNextPatrolLeg();
    this.pendingPatrolLeg = null;
    this.patrolBlocked = leg === null;
    if (leg) {
      this.followPatrolLeg(leg);
    }
  }

  private planNextPatrolLeg(): PatrolLeg | null {
    const guardCell = worldToCell({ x: this.guard.x, y: this.guard.y }, TILE_SIZE);
    const leg = planPatrolLeg(
      LAB_MAP,
      guardCell,
      PATROL_POINTS,
      this.patrolState.targetIndex,
      this.navigationAlgorithm,
    );
    if (leg) {
      this.patrolState = withPatrolTarget(this.patrolState, leg.targetIndex, PATROL_POINTS.length);
    }
    return leg;
  }

  private followPatrolLeg(leg: PatrolLeg): void {
    const goal = PATROL_POINTS[leg.targetIndex];
    if (!goal) {
      throw new Error("Patrol point invariant failed.");
    }
    this.navigationGoal = goal;
    this.applyRoute(leg.route);
  }

  private updateGuardPatrol(time: number): void {
    if (!this.patrolEnabled || this.patrolBlocked || this.investigation) {
      return;
    }

    const wasPausing = this.patrolState.phase === "pausing";
    const result = updatePatrol(this.patrolState, {
      pointCount: PATROL_POINTS.length,
      arrived: this.nextWaypoint >= this.guardWaypoints.length,
      timeMs: time,
    });
    this.patrolState = result.state;

    if (!wasPausing && result.state.phase === "pausing") {
      this.pendingPatrolLeg = this.planNextPatrolLeg();
      this.patrolBlocked = this.pendingPatrolLeg === null;
      this.record("patrulla", "EN CAMINO", "llegada al punto", "PAUSA",
        `proximo P${this.patrolState.targetIndex + 1}`);
      return;
    }

    if (result.look === "next" && this.pendingPatrolLeg) {
      const direction = firstStepDirection(this.pendingPatrolLeg.route);
      if (direction) {
        this.guardFacing = direction;
      }
    }

    if (result.departed) {
      this.startPatrolLeg();
      this.record("patrulla", "PAUSA", "fin de la pausa", "EN CAMINO",
        `hacia P${this.patrolState.targetIndex + 1}`);
    }
  }

  private patrolSummary(): string {
    const point = `P${this.patrolState.targetIndex + 1}/${PATROL_POINTS.length}`;
    if (!this.patrolEnabled) {
      return `patrulla ${point} SUSPENDIDA`;
    }
    if (this.patrolBlocked) {
      return `patrulla ${point} BLOQUEADA`;
    }
    return `patrulla ${point} ${this.patrolState.phase === "pausing" ? "PAUSA" : "EN CAMINO"}`;
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.patrolEnabled) {
      this.record("patrulla", "activa", "clic", "suspendida", "destino manual");
    }
    this.patrolEnabled = false;
    this.investigation = null;
    this.distractionMarker.setVisible(false);
    this.navigationGoal = worldToCell({ x: pointer.worldX, y: pointer.worldY }, TILE_SIZE);
    this.renderNavigation();
  }

  private renderNavigation(): void {
    const guardCell = worldToCell({ x: this.guard.x, y: this.guard.y }, TILE_SIZE);
    const result = calculateRoute(
      LAB_MAP,
      guardCell,
      this.navigationGoal,
      this.navigationAlgorithm,
    );
    this.applyRoute(result);
  }

  private applyRoute(result: SearchResult): void {
    this.drawSearchResult(result);
    this.guardWaypoints = result.status === "success"
      ? result.path.map((point) => cellCenter(point, TILE_SIZE))
      : [];
    this.nextWaypoint = 0;

    const targetPosition = cellCenter(this.navigationGoal, TILE_SIZE);
    this.targetMarker.setPosition(targetPosition.x, targetPosition.y);
    this.targetMarker.setStrokeStyle(3, result.status === "success" ? 0x73c991 : 0xe16969);

    const cost = result.totalCost === null ? "-" : String(result.totalCost);
    const algorithm = result.algorithm === "astar" ? "A*" : "BFS";
    this.navigationSummary = [
      `${algorithm} / ${STATUS_LABELS[result.status]}`,
      `costo ${cost} | expandidos ${result.expandedNodes}`,
      `frontera maxima ${result.maximumFrontier}`,
    ];
  }

  private drawSearchResult(result: SearchResult): void {
    this.navigationGraphics.clear();
    this.navigationGraphics.fillStyle(0x3b819c, 0.22);
    for (const point of result.explored) {
      this.navigationGraphics.fillRect(
        point.x * TILE_SIZE + 3,
        point.y * TILE_SIZE + 3,
        TILE_SIZE - 6,
        TILE_SIZE - 6,
      );
    }

    const firstPoint = result.path[0];
    if (!firstPoint) {
      return;
    }

    const firstCenter = cellCenter(firstPoint, TILE_SIZE);
    this.navigationGraphics.lineStyle(4, 0x62d0e8, 0.9);
    this.navigationGraphics.beginPath();
    this.navigationGraphics.moveTo(firstCenter.x, firstCenter.y);
    for (const point of result.path.slice(1)) {
      const center = cellCenter(point, TILE_SIZE);
      this.navigationGraphics.lineTo(center.x, center.y);
    }
    this.navigationGraphics.strokePath();
  }

  private updateGuardMovement(delta: number): void {
    const previous = { x: this.guard.x, y: this.guard.y };
    const movement = advanceAlongPath(
      previous,
      this.guardWaypoints,
      this.nextWaypoint,
      GUARD_SPEED * delta / 1000,
    );
    this.nextWaypoint = movement.nextWaypoint;
    this.guard.setPosition(movement.position.x, movement.position.y);

    if (movement.direction) {
      this.guardFacing = movement.direction;
    }
  }

  private updatePerception(time: number): void {
    const observer = { x: this.guard.x, y: this.guard.y };
    const target = { x: this.player.x, y: this.player.y };
    const frame = updatePerceptionSimulation(this.perceptionState, {
      map: LAB_MAP,
      tileSize: TILE_SIZE,
      observer,
      facing: this.guardFacing,
      target,
      visionRange: VISION_RANGE,
      fieldOfViewRadians: FIELD_OF_VIEW,
      timeMs: time,
    });
    this.perceptionState = frame.state;

    if (frame.soundHeard && frame.state.soundEvent) {
      this.startSoundInvestigation(
        frame.state.soundEvent.position,
        frame.state.soundEvent.emittedAtMs,
      );
    }
    this.updateAlert(time, frame.vision.visible);

    this.drawPerception(frame.vision);
    this.drawAlert(time);
    this.updateTelemetry(time, frame.vision, frame.soundHeard);
  }

  private updateAlert(time: number, playerVisible: boolean): void {
    // Elapsed scene time, not the smoothed frame delta, so the rates hold at low frame rates.
    const deltaMs = this.lastAlertUpdateMs === null ? 0 : Math.max(0, time - this.lastAlertUpdateMs);
    this.lastAlertUpdateMs = time;
    const previous = this.alertMeter;
    this.alertMeter = updateAlertMeter(previous, { playerVisible, deltaMs });
    if (previous.level === this.alertMeter.level) {
      return;
    }

    this.record("alerta", LEVEL_LABELS[previous.level], "cambio de nivel",
      LEVEL_LABELS[this.alertMeter.level],
      `medidor ${Math.round(this.alertMeter.value)}, vision ${playerVisible ? "si" : "no"}`);
    if (shouldTriggerAlertImpact(previous.level, this.alertMeter.level)) {
      this.impactCount += 1;
      this.impactMarkerUntilMs = time + IMPACT_MARK_MS;
      this.cameras.main.shake(IMPACT_SHAKE_MS, 0.012);
      this.cameras.main.flash(IMPACT_FLASH_MS, 225, 80, 80);
      this.record("impacto", "sin efecto", "entrada en ALERTA", "temblor+destello+signo",
        `impacto ${this.impactCount}`);
    }
  }

  private drawAlert(time: number): void {
    const color = LEVEL_COLORS[this.alertMeter.level];
    const filled = ALERT_BAR.width * this.alertMeter.value / ALERT_MAX;
    this.alertGraphics.clear();
    this.alertGraphics.fillStyle(0x10161c, 0.85);
    this.alertGraphics.fillRect(ALERT_BAR.x, ALERT_BAR.y, ALERT_BAR.width, ALERT_BAR.height);
    this.alertGraphics.fillStyle(color, 1);
    this.alertGraphics.fillRect(ALERT_BAR.x, ALERT_BAR.y, filled, ALERT_BAR.height);
    this.alertGraphics.lineStyle(1, 0x9eb4c2, 1);
    this.alertGraphics.strokeRect(ALERT_BAR.x, ALERT_BAR.y, ALERT_BAR.width, ALERT_BAR.height);
    if (this.alertMeter.level !== "calm") {
      this.alertGraphics.lineStyle(4, color, this.alertMeter.level === "alert" ? 0.9 : 0.5);
      this.alertGraphics.strokeRect(2, 2, GRID_WIDTH * TILE_SIZE - 4, GRID_HEIGHT * TILE_SIZE - 4);
    }
    this.alertLabel.setText(LEVEL_LABELS[this.alertMeter.level]);
    this.alertLabel.setColor(`#${color.toString(16).padStart(6, "0")}`);

    this.impactMarker
      .setVisible(time < this.impactMarkerUntilMs)
      .setPosition(this.guard.x, this.guard.y - 14);
  }

  private drawPerception(vision: VisionResult): void {
    this.perceptionGraphics.clear();
    const outline = visionConeOutline({
      map: LAB_MAP,
      tileSize: TILE_SIZE,
      observer: { x: this.guard.x, y: this.guard.y },
      facing: this.guardFacing,
      range: VISION_RANGE,
      fieldOfViewRadians: FIELD_OF_VIEW,
      rayCount: CONE_RAY_COUNT,
    });
    if (outline.length > 0) {
      const color = LEVEL_COLORS[this.alertMeter.level];
      this.perceptionGraphics.fillStyle(color, vision.visible ? 0.32 : 0.16);
      this.perceptionGraphics.beginPath();
      this.perceptionGraphics.moveTo(this.guard.x, this.guard.y);
      for (const point of outline) {
        this.perceptionGraphics.lineTo(point.x, point.y);
      }
      this.perceptionGraphics.closePath();
      this.perceptionGraphics.fillPath();
      if (vision.visible) {
        this.perceptionGraphics.lineStyle(2, color, 0.9);
        this.perceptionGraphics.strokePath();
      }
    }

    if (this.perceptionState.soundEvent) {
      this.perceptionGraphics.lineStyle(2, 0xe5b454, 0.8);
      this.perceptionGraphics.strokeCircle(
        this.perceptionState.soundEvent.position.x,
        this.perceptionState.soundEvent.position.y,
        this.perceptionState.soundEvent.radius,
      );
    }

    if (!this.perceptionState.soundEvent && !this.investigation) {
      this.distractionMarker.setVisible(false);
    }

    const lastKnown = this.perceptionState.memory.lastKnownPosition;
    this.lastKnownMarker.setVisible(lastKnown !== null);
    if (lastKnown) {
      this.lastKnownMarker.setPosition(lastKnown.x, lastKnown.y);
    }
  }

  private distractionSummary(time: number): string {
    const remaining = distractionCooldownRemaining(this.lastThrowAtMs, time);
    return remaining === 0
      ? "distractor LISTO"
      : `distractor RECARGA ${(remaining / 1000).toFixed(1)}s`;
  }

  private updateTelemetry(time: number, vision: VisionResult, soundHeard: boolean): void {
    const age = timeSinceLastPerception(this.perceptionState.memory, time);
    const memory = age === null
      ? "memoria -"
      : `memoria ${this.perceptionState.memory.source} ${(age / 1000).toFixed(1)}s`;
    const sound = this.perceptionState.soundEvent
      ? (soundHeard ? "OIDO" : "FUERA DE RANGO")
      : "-";

    this.navigationHud.setText([
      ...this.navigationSummary,
      this.patrolSummary(),
      `alerta ${Math.round(this.alertMeter.value)} ${LEVEL_LABELS[this.alertMeter.level]}`,
      `impactos ${this.impactCount} | camara ${
        this.cameras.main.shakeEffect.isRunning ? "SACUDIDA" : "ESTABLE"
      }`,
      this.distractionSummary(time),
      `guardia ${this.guardActivity()}${this.soundUnreachable ? " (SONIDO INALCANZABLE)" : ""}`,
      `vision ${VISION_LABELS[vision.reason]}`,
      `sonido ${sound}`,
      memory,
    ]);
  }
}
