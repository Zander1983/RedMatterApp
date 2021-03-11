/*
    This is responsible to implement polygons, and their logic
*/
interface Point {
    x: number
    y: number
}

interface PolygonParams {
    points: Array<Point>
}

export default class Polygon {
    private points: Array<Point>

    constructor({ points }: PolygonParams) {
        this.points = points
    }

    getLength(): number {
        return this.points.length
    }

    getPoint(i: number): Point {
        return this.points[i]
    }

    private onSegment (p: Point, q: Point, r: Point): boolean {
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
            return true
        return false
    }

    private orientation (p: Point, q: Point, r: Point): 0 | 1 | 2 {
        let val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y)

        if (val === 0) return 0 // colinear 

        return (val > 0) ? 1 : 2// clock or counterclock wise 
    }

    private segmentIntersection (p1: Point, p2: Point, q1: Point, q2: Point): boolean {
        let o1 = this.orientation(p1, q1, p2)
        let o2 = this.orientation(p1, q1, q2)
        let o3 = this.orientation(p2, q2, p1)
        let o4 = this.orientation(p2, q2, q1)

        // General case 
        if (o1 !== o2 && o3 !== o4)
            return true

        // Special Cases 
        // p1, q1 and p2 are colinear and p2 lies on segment p1q1 
        if (o1 === 0 && this.onSegment(p1, p2, q1))
            return true

        // p1, q1 and q2 are colinear and q2 lies on segment p1q1 
        if (o2 === 0 && this.onSegment(p1, q2, q1))
            return true

        // p2, q2 and p1 are colinear and p1 lies on segment p2q2 
        if (o3 === 0 && this.onSegment(p2, p1, q2))
            return true

        // p2, q2 and q1 are colinear and q1 lies on segment p2q2 
        if (o4 === 0 && this.onSegment(p2, q1, q2))
            return true

        return false; // Doesn't fall in any of the above cases 
    }

    insideOrEdgePolygon ({x, y}: Point): boolean {
        /*
            https://en.wikipedia.org/wiki/Point_in_polygon#Ray_casting_algorithm
            Shameless copy from geeks to geeks
        */
        const p1 = {
            x: 1e10,
            y: y
        }
        const q1 = {
            x: x,
            y: y
        }
        let hits = 0
        const pl = this.points.length
        for (let i = 0; i < pl; i++) {
            const a = this.points[i]
            const b = this.points[(i + 1) % pl]
            const p2 = {
                x: a.x,
                y: a.y
            }
            const q2 = {
                x: b.x,
                y: b.y
            }
            if (this.segmentIntersection(p1, p2, q1, q2)) {
                if (this.orientation(p2, q1, q2) === 0)
                    return this.onSegment(p2, q1, q2)
                hits++
            }
        }
        if (hits & 1)
            return true
        return false
    }
}