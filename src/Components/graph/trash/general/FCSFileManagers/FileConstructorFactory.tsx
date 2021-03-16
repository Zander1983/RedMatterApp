/*
  Reconstructor Interace - Is an abstract class that is returned by the 
*/

export default abstract class Reconstructor {
  // Database FCS files
  getFileFromURL(url: str) {
    /* adapt to interface and return */
  }

  // Database FCS files
  getFileFromDevice(fcsfile: any) {
    /* adapt to interface and return */
  }

  getFileFromLocal(file: object) {}
}
