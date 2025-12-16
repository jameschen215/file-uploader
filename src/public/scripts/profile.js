import { showModal } from './lib/modal-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const editProfileButton = document.querySelector('.edit-profile-btn');
  const changePswButton = document.querySelector('.change-psw-btn');
  const deleteUserButton = document.querySelector('.delete-user-btn');

  editProfileButton.addEventListener('click', handleEditProfile);

  changePswButton.addEventListener('click', handleUpdatePassword);

  deleteUserButton.addEventListener('click', () => {
    console.log('Handle delete user');
  });

  // Handlers
  function handleEditProfile() {
    const editProfileModal = document.querySelector('#edit-profile-modal');
    const user = JSON.parse(this.dataset.user);

    showModal({ modal: editProfileModal, user });
  }

  function handleUpdatePassword() {
    const updatePswModal = document.querySelector('#update-password-modal');
    const user = JSON.parse(this.dataset.user);
    showModal({ modal: updatePswModal, user });
  }
});
