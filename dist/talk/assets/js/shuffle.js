import { headerData } from "/assets/js/data/header.js";

console.info("navigation", headerData.navigation);

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Shuffle the navigation features
headerData.navigation = shuffleArray(headerData.navigation);
console.info("shuffled navigation", headerData.navigation);
// Save shuffled navigation to local storage
localStorage.setItem("shuffledHeaderData", JSON.stringify(headerData));
// Redirect to the first navigation item
if (headerData.navigation.length > 0) {
  console.info("headerData.navigation[0]", headerData.navigation[0]);
  const firstItem = headerData.navigation[0];
  setTimeout(() => {
    window.location.href = `/features/${firstItem.name}/index1.html?talk=true`;
  }, 6000);
}
