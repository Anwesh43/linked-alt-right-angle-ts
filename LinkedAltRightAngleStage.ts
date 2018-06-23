const w : number = window.innerWidth, h : number = window.innerHeight, ARA_NODES : number = 5

class LinkedAltRightAngleStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    lara : LinkedAltRightAngle = new LinkedAltRightAngle()

    animator : ARAAnimator = new ARAAnimator()
    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.clearRect(0, 0, w, h)
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.lara.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.lara.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.lara.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedAltRightAngleStage = new LinkedAltRightAngleStage()
        stage.render()
        stage.handleTap()
    }
}

class ARAState {
    scales : Array<number> = [0, 0]

    prevScale : number = 0

    dir : number = 0

    j : number = 0

    update(stopcb : Function) {
        this.scales[this.j] += 0.1 * this.dir
        if (Math.abs(this.scales[this.j] - this.prevScale) > 1) {
            this.scales[this.j] = this.prevScale + this.dir
            this.j += this.dir
            if (this.j == this.scales.length || this.j == -1) {
                this.j -= this.dir
                this.dir = 0
                this.prevScale = this.scales[this.j]
                stopcb()
            }
        }
    }

    startUpdating(startcb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            startcb()
        }
    }
}

class ARAAnimator {
    animated : boolean = false

    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class ARANode {

    state : ARAState = new ARAState()

    next : ARANode

    prev : ARANode

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < ARA_NODES - 1) {
            this.next = new ARANode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = (0.9 * Math.min(w, h)) / ARA_NODES
        const dist : number = gap * this.state.scales[0]
        if (this.prev) {
            this.prev.draw(context)
        }
        context.save()
        context.translate(gap/10 + (this.i * gap - gap) + dist, h - gap /10 - (this.i * gap - gap + gap/3) - dist)
        var index : number = this.i%2
        var scale : number = index * (1 - this.state.scales[1]) + (this.state.scales[1]) * (1 - index)
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        context.strokeStyle = '#9b59b6'
        for(var i = 0; i < 2; i++) {
            context.save()
            context.rotate(scale * i * -Math.PI/2)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(gap, 0)
            context.stroke()
            context.restore()
        }
        context.restore()
    }

    update(stopcb : Function) {
        this.state.update(stopcb)
    }

    startUpdating(startcb : Function) {
        this.state.startUpdating(startcb)
    }

    getNext(dir : number, cb : Function) {
        var curr : ARANode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedAltRightAngle {

    curr : ARANode = new ARANode(0)

    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(stopcb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            stopcb()
        })
    }

    startUpdating(startcb : Function) {
        this.curr.startUpdating(startcb)
    }
}

LinkedAltRightAngleStage.init()
