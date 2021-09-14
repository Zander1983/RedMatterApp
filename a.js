const N = 1000000;
const M = 10;

let a = [];
for (let i = 0; i < N; i++) {
  a.push(new Float32Array(M));
}

let b4 = new Date().getTime();
for (let j = 0; j < N; j++) {
  const x = [];
  for (let i = 0; i < M; i++) {
    x.push(a[i][j]);
  }
  for (let i = 0; i < 100; i++) {
    for (let k = 0; k < M; k++) {
      x[k] += i * k;
      x[k] /= i;
    }
  }
  for (let i = 0; i < M; i++) {
    a[i][j] = x[i];
  }
}
console.log("time (float32array):", new Date().getTime() - b4);

a = [];
for (let i = 0; i < M; i++) {
  a.push(new Array(N));
}

b4 = new Date().getTime();
for (let j = 0; j < N; j++) {
  const x = [];
  for (let i = 0; i < M; i++) {
    x.push(a[i][j]);
  }
  for (let i = 0; i < 100; i++) {
    for (let k = 0; k < M; k++) {
      x[k] += i * k;
      x[k] /= i;
    }
  }
  for (let i = 0; i < M; i++) {
    a[i][j] = x[i];
  }
}
console.log("time (array):", new Date().getTime() - b4);
