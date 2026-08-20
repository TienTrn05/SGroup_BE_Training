// function testPokemon() {
//   fetch("https://pokeapi.co/api/v2/pokemon/1")
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// }

// testPokemon();

function getUser() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 1,
        name: "John",
      });
    }, 2000);
  });
}
async function main() {
  const user = await getUser();

  console.log(user);
}

main();
