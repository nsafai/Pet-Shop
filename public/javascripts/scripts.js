/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
if (document.querySelector('#new-pet')) {
  document.querySelector('#new-pet').addEventListener('submit', (e) => {
    e.preventDefault();

    // Use FormData to grab everything now that we have files mixed in with text
    const form = document.getElementById('new-pet');
    const pet = new FormData(form);

    axios.post('/pets', pet, {
      headers: {
        'Content-Type': 'multipart/form-data;',
      },
    })
      .then((response) => {
        window.location.replace(`/pets/${response.data.pet._id}`);
      })
      .catch((error) => {
        const alert = document.getElementById('alert');
        alert.classList.add('alert-warning');
        alert.textContent = `${error} Oops, something went wrong saving your pet. Please check your information and try again.`;
        alert.style.display = 'block';
        setTimeout(() => {
          alert.style.display = 'none';
          alert.classList.remove('alert-warning');
        }, 3000);
      });
  });
}
