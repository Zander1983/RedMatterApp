/*
  About the challange:
    There are many magic numbers floating around here. As this is a code
    challange, I've not taken the proper care to make the code beautiful,
    my objective was solely to fullfill the challange here.
*/

export const insideOrEdgePolygon = (x:any, y:any, polygon:any) => {
  /*
    Simple logic: if the point (x, y) is inside polygon, then
    it's to the same side (left or right) of all edge vectors from polygon

    ANNND you gave me a concave polygon to work with :/
    Keeping this as a reminder that I can never be too careful
  */
  const pl = polygon.length
  let dir = null
  for (let i = 0; i < pl; i++) {
    // polygon edge vector point A and B
    const a = polygon[i]
    const b = polygon[(i + 1) % pl]
    // center graph around point A
    const cx = x - a[0]
    const cy = y - a[1]
    const vx = b[0] - a[0]
    const vy = b[1] - a[1]

    const crossproduct = vy * cx - vx * cy
    
    if (crossproduct === 0) continue

    if (dir === null) dir = crossproduct / Math.abs(crossproduct)
    else {
      let current_dir = crossproduct / Math.abs(crossproduct)
      if (current_dir !== dir) return false
    }
  }
  return true
}

const onSegment = (p:any, q:any, r:any) => {
  if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && 
      q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) 
    return true
  return false
}

const orientation = (p:any, q:any, r:any) => { 
  let val = (q.y - p.y) * (r.x - q.x) - 
            (q.x - p.x) * (r.y - q.y)

  if (val === 0) return 0 // colinear 

  return (val > 0)? 1: 2// clock or counterclock wise 
}

export const segmentIntersection = (p1:any, p2:any, q1:any, q2:any) => {
  let o1 = orientation(p1, q1, p2)
  let o2 = orientation(p1, q1, q2)
  let o3 = orientation(p2, q2, p1)
  let o4 = orientation(p2, q2, q1)

  // General case 
  if (o1 !== o2 && o3 !== o4) 
      return true

  // Special Cases 
  // p1, q1 and p2 are colinear and p2 lies on segment p1q1 
  if (o1 === 0 && onSegment(p1, p2, q1))
    return true 

  // p1, q1 and q2 are colinear and q2 lies on segment p1q1 
  if (o2 === 0 && onSegment(p1, q2, q1))
    return true 

  // p2, q2 and p1 are colinear and p1 lies on segment p2q2 
  if (o3 === 0 && onSegment(p2, p1, q2))
    return true 

    // p2, q2 and q1 are colinear and q1 lies on segment p2q2 
  if (o4 === 0 && onSegment(p2, q1, q2))
    return true 

  return false; // Doesn't fall in any of the above cases 
}

export const raycastPointInsidePolygon = (x:any, y:any, polygon:any) => {
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
  const pl = polygon.length
  for (let i = 0; i < pl; i++) {
    const a = polygon[i]
    const b = polygon[(i + 1) % pl]
    const p2 = {
      x: a[0],
      y: a[1]
    }
    const q2 = {
      x: b[0],
      y: b[1]
    }
    if (segmentIntersection(p1, p2, q1, q2)) {
      if (orientation(p2, q1, q2) === 0) 
        return onSegment(p2, q1, q2)
      hits++
    }
  }
  if (hits & 1)
    return true
  return false
}