async function fetchData() {
  try {
    const dropdown = document.getElementById('select');
    const selectedOption = dropdown.options[dropdown.selectedIndex];

    const method = selectedOption.value;

    const response = await fetch('/?check=true', {
      method,
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`error, status: ${response.status}`);
    }
    // const data = await response.json();
    const element = document.getElementById('visibleContent');
    element.style.visibility = 'visible';
  } catch (e) {}
}
document.getElementById('toggleButton').addEventListener('click', fetchData);
