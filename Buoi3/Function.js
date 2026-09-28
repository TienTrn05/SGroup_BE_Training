let arr = [1, 2, 3, 4, 5];

function foreach2(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i, arr);
  }
}

arr.forEach2((item) => {
  console.log(`Item: ${item}, Index: ${index}`);
});
