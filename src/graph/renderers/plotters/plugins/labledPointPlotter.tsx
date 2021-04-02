for (const special of this.specialPointsList) {
  if (special.concrete === true) {
    this.drawer.circle({
      x: special.x * this.scale,
      y: special.y * this.scale,
      radius: 3,
      fillColor: special.color,
    });
  } else {
    plotGraph.addPoint(special.x, special.y, 5, special.color);
  }
  if (special.text !== undefined) {
    if (special.concrete !== true) {
      const { x, y } = this.drawer.convertToPlotCanvasPoint(
        special.x,
        special.y
      );
      this.drawer.text({
        x: (x + 5) * this.scale,
        y: (y - 5) * this.scale,
        text: special.text,
        font: "30px Roboto black",
      });
    } else {
      this.drawer.text({
        x: (special.x + 5) * this.scale,
        y: (special.y - 5) * this.scale,
        text: special.text,
        font: "30px Roboto black",
      });
    }
  }
}
