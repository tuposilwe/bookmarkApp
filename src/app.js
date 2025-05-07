// document.getElementById("openModalBtn").addEventListener("click", () => {
//   window.electronAPI.openModal();
// });

let showModal = document.getElementById("show-modal"),
  closeModal = document.getElementById("close-modal"),
  modal = document.getElementById("modal"),
  addItem = document.getElementById("add-item"),
  itemUrl = document.getElementById("url"),
  search = document.getElementById("search"),
  items;


const getSelectedItem = () => {
  // Get selected node
  let currentItem = document.getElementsByClassName("read-item selected")[0];

  // Get Item index
  let itemIndex = 0;
  let child = currentItem;
  while ((child = child.previousSibling) != null) itemIndex++;

  // Return selected item and index
  return {
    node: currentItem,
    index: itemIndex,
  };
};

// Set item as selected
const select = (e) => {
  // Remove currently selected item class
  getSelectedItem().node.classList.remove("selected");

  // Add to clicked item
  e.currentTarget.classList.add("selected");
};

// Filter items with "search"
search.addEventListener("keyup", (e) => {
  // Loop items
  Array.from(document.getElementsByClassName("read-item")).forEach((item) => {
    // Hide items that don't match search value
    let hasMatch = item.innerText.toLowerCase().includes(search.value);
    item.style.display = hasMatch ? "flex" : "none";
  });
});

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

// Track items in storage
let storage = JSON.parse(localStorage.getItem("readit-items")) || [];

// Save items to localStorage
const save = () => {
  localStorage.setItem("readit-items", JSON.stringify(storage));
};

const openItem = () => {
  // only if we have items (in case of menu open)
  if (!storage.length) return;

  // Get selected item
  let selectedItem = getSelectedItem().node;

  let selectedIndex = getSelectedItem().index;

  // Get item's url
  let contentURL = selectedItem.dataset.url;

  // Open item in proxy BrowserWindow
  window.electronAPI.openReadWindow(contentURL, selectedIndex);

  console.log("Opening item: ", contentURL);
};

// Add item to DOM
function addItems(item) {
  items = document.getElementById("items");

  const itemNode = document.createElement("div");
  itemNode.setAttribute("class", "read-item");

  itemNode.setAttribute("data-url", item.url);
  itemNode.innerHTML = `<img src="${item.screenshot}"/><h2>${item.title}</h2>`;

  items.appendChild(itemNode);

  // Attach click handler to select
  itemNode.addEventListener("click", select);

  itemNode.addEventListener("dblclick", openItem);

  // if this is the first item,select it
  if (document.getElementsByClassName("read-item").length === 1) {
    itemNode.classList.add("selected");
  }
}

// Listen for new item event from preload
window.addEventListener("new-item", (event) => {
  const newItem = event.detail;

  addItems(newItem);

  // Optional: prevent duplicates
  if (!storage.find((i) => i.url === newItem.url)) {
    storage.push(newItem);
    save();
  }
});

// Add items from storage when app loads
storage.forEach((item) => {
  addItems(item);
});


// move to newly selected item
const changeSelection = (direction) => {
  let currentItem = getSelectedItem().node;

  // Handle up/down
  if (direction === "ArrowUp" && currentItem.previousSibling) {
    currentItem.classList.remove("selected");
    currentItem.previousSibling.classList.add("selected");
  } else if (direction === "ArrowDown" && currentItem.nextSibling) {
    currentItem.classList.remove("selected");
    currentItem.nextSibling.classList.add("selected");
  }
};

// Navigate item selection with up/down arrows
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    changeSelection(e.key);
  }
});

const deleteItem = (itemIndex) => {
  // Remove item from DOM
  items.removeChild(items.childNodes[itemIndex]);

  // Remove from storage
  storage.splice(itemIndex, 1);

  // Persist
  save();

  // Select previos item or new first item if first was deleted
  if (storage.length) {
    // Get new selected item index
    let newSelectedItemIndex = itemIndex === 0 ? 0 : itemIndex - 1;

    // set item at new index as selected
    document
      .getElementsByClassName("read-item")
      [newSelectedItemIndex].classList.add("selected");
  }
};

window.electronAPI.onEvent("event-to-main", (e, data) => {
  // document.getElementById("msg").innerText = `Received: ${data.message}`;
  // console.log(data.itemIndex);
  deleteItem(data.itemIndex);
  
});

window.electronAPI.openAddModal(() => {
  showModal.click();
});

window.electronAPI.openItem(() => {
  openItem();
});


window.electronAPI.deleteItem(() => {
  let selected = getSelectedItem();
  deleteItem(selected.index);
});

window.electronAPI.openItemNative(()=>{

  // Only if we have items
   if(!storage.length) return;

   const selectedNode = getSelectedItem().node;
   const url = selectedNode?.dataset?.url;

   window.electronAPI.openExternal(url);

})

window.electronAPI.openSearch(()=>{
  search.focus()
})