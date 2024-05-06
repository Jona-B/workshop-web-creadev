import Scene2D from "../../canvas-2d/Scene2D"
import { line } from "../../canvas-2d/Shapes2D"
import { clamp, distance2d, randomRange } from "../../utils/MathUtils"
import Bubble from "./Bubbles"

export default class SceneBouncingBubbles extends Scene2D {
    constructor(nBubbles, id = "canvas-scene") {
        super(id)

        /** debug */
        this.params.threshold = 75
        this.params.lineWidth = 2
        this.params.speed = 1
        this.params.radius = 10
        this.params.nBubbles = nBubbles
        this.params.gStrength = 300
        if (this.debug.active) {
            this.debugFolder.add(this.params, 'threshold', 0, 350)
            this.debugFolder.add(this.params, 'lineWidth', 0, 15).name("line width")
            this.debugFolder.add(this.params, 'speed', -3, 3)
            this.debugFolder.add(this.params, 'radius', 0, 30).onChange(() => {
                this.bubbles.forEach(b => b.radius = this.params.radius)
                this.clear()
                this.draw()
            })
            this.debugFolder.add(this.params, 'nBubbles', 0, 200).onFinishChange(() => this.generateBubbles())
            this.debugFolder.add(this.params, 'gStrength', 0, 500)
        }

        /** device motion */
        this.debug.domDebug = "init"
        this.windowContext.useDeviceOrientation = true
        this.orientation = this.windowContext.orientation

        /** init */
        this.generateBubbles()
    }

    generateBubbles() {
        this.bubbles = []
        for (let i = 0; i < this.params.nBubbles; i++) {
            const radius_ = 10
            const x_ = randomRange(radius_, this.width - radius_)
            const y__ = randomRange(radius_, this.height - radius_)
            const bubble_ = new Bubble(this.context, x_, y__, radius_)
            this.bubbles.push(bubble_)
        }
        this.clear()
        this.draw()
    }

    addBubble(x, y, vx = null, vy = null) {
        const newBubble = new Bubble(this.context, x, y, this.params.radius);
        if (vx !== null && vy !== null) {
            newBubble.vx = vx;
            newBubble.vy = vy;
        }
        this.bubbles.push(newBubble);
    }
    
    removeBubble(bubble) {
        this.bubbles = this.bubbles.filter(b => b !== bubble);
    }

    update() {
        if (!super.update()) return

        this.clear()
        this.bubbles.forEach(b => {
            /** test gravity */
            // const angle_ = this.currentTime / 1000
            // b.gx = Math.cos(angle_) * this.params.gStrength
            // b.gy = Math.sin(angle_) * this.params.gStrength

            /** update bubble */
            b.update(
                this.width,
                this.height,
                this.windowContext.time.delta,
                this.params.speed
            )
        })
        this.draw()
    }

    draw() {
        /** style */
        this.context.strokeStyle = "white"
        this.context.fillStyle = "black"
        this.context.lineCap = "round"
        this.context.lineWidth = this.params.lineWidth

        if (!!this.bubbles) {
            for (let i = 0; i < this.bubbles.length; i++) {
                const current_ = this.bubbles[i]
                for (let j = i; j < this.bubbles.length; j++) {
                    const next_ = this.bubbles[j]

                    if (distance2d(current_.x, current_.y, next_.x, next_.y) < this.params.threshold) {
                        line(this.context, current_.x, current_.y, next_.x, next_.y)
                    }
                }
            }

            this.bubbles.forEach(b => {
                b.draw()
            })
        }
    }

    onDeviceOrientation() {
        /** debug angle */
        let debugCoordinates = "";
        debugCoordinates = debugCoordinates.concat(
          // this.orientation.alpha.toFixed(2), ", ",
          this.orientation.gamma.toFixed(2), ", ", // -> around Y = left / right
          this.orientation.beta.toFixed(2)  // -> around X = forward / backward
        );
        this.debug.domDebug = debugCoordinates;
      
        /** gravity orientation */
        let gx = this.orientation.gamma / 90; // -1 : 1
        let gy = this.orientation.beta / 90; // -1 : 1
        gx = clamp(gx, -1, 1);
        gy = clamp(gy, -1, 1);
      
        /** debug gravity orientation (combined comment) */
        let gravityCoordinates = "";
        gravityCoordinates = gravityCoordinates.concat(
          gx.toFixed(2), ", ",  // around Y = left / right
          gy.toFixed(2)   // around X = forward / backward
        );
        this.debug.domDebugGravity = gravityCoordinates; // Assuming another property for gravity debug
      
        /** update */
        gx *= this.params.gStrength; // apply gravity strength
        gy *= this.params.gStrength; // apply gravity strength
        if (!!this.bubbles) {
          this.bubbles.forEach(b => {
            b.gx = gx;
            b.gy = gy;
          });
        }
      }
      

    resize() {
        super.resize();
    
        if (!!this.bubbles) {
            this.bubbles.forEach(b => {
                b.x = b.x > this.width - b.radius ? this.width - b.radius : b.x;
                b.y = b.y > this.height - b.radius ? this.height - b.radius : b.y;
            });
        }
    }    
}