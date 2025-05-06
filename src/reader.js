
module.exports = `
(() => {
  const button = document.createElement("div");
  button.textContent = "Done";
  
  Object.assign(button.style, {
    position: "fixed",
    bottom: "15px",
    right: "15px",
    padding: "15px",
    fontSize: "20px",
    fontWeight: "bold",
    background: "dodgerblue",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
    boxShadow: "2px 2px 2px rgba(0,0,0,0.2)"
  });

 // In the iframe: send message to parent window

  button.addEventListener('click', () => {
    window.electronAPI.sendToMain('event-from-child', { message: 'Hello from Child!' , itemIndex: {{ index }}});
    window.close()
  })

  document.body.appendChild(button);
})();
`;
