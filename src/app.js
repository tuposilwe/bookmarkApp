// document.getElementById("openModalBtn").addEventListener("click", () => {
//   window.electronAPI.openModal();
// });

let showModal = document.getElementById("show-modal"),
  closeModal = document.getElementById("close-modal"),
  modal = document.getElementById("modal"),
  addItem = document.getElementById("add-item"),
  itemUrl = document.getElementById("url");

// Show modal
showModal.addEventListener("click", () => {
  modal.style.display = "flex";
  itemUrl.focus();
  window.electronAPI.openModal();
});

// Hide modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
  window.electronAPI.closeModal();
});

//Disable & enable modal buttons
const toggleModalButtons = (isLoading) => {
  if (isLoading) {
    addItem.disabled = true;
    addItem.style.opacity = 0.5;
    addItem.innerText = "Adding...";
    closeModal.style.display = "none";
  } else {
    addItem.disabled = false;
    addItem.style.opacity = 1;
    addItem.innerText = "Add Item";
    closeModal.style.display = "inline";
  }
};

// Handle new Item
function submitItem() {
  if (itemUrl.value) {
    toggleModalButtons(true); // Set loading state
    window.electronAPI.submitUrl(itemUrl.value);

    // Simulate delay before resetting UI
    setTimeout(() => {
      // Hide modal and clear input
      modal.style.display = "none";
      itemUrl.value = "";

      toggleModalButtons(false); // Reset to ready state
    }, 2000); // 1000ms = 1 second
  }
}

addItem.addEventListener("click", submitItem);

itemUrl.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    submitItem();
  }
});
