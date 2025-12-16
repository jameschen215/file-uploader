import { showModal } from './lib/modal-helpers.js';
// import { confirmDeletion } from './components/modals/confirm-modal.js';

document.addEventListener('DOMContentLoaded', () => {
  const editProfileButton = document.querySelector('.edit-profile-btn');
  const changePswButton = document.querySelector('.change-psw-btn');
  const deleteUserButton = document.querySelector('.delete-user-btn');

  if (editProfileButton) {
    editProfileButton.addEventListener('click', handleEditProfile);
  }

  if (changePswButton) {
    changePswButton.addEventListener('click', handleUpdatePassword);
  }

  // deleteUserButton.addEventListener('click', handleDeleteUser);

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

  // async function handleDeleteUser() {
  //   console.log('Handle delete user');

  //   const user = JSON.parse(this.dataset.user);

  //   const confirmed = await confirmDeletion({ user });

  //   if (!confirmed) return;

  //   // Set up deleting state
  //   deleteUserButton.disabled = true;
  //   deleteUserButton.textContent = 'Deleting...';

  //   try {
  //     const url = `/users/`;
  //   } catch (error) {}
  // }
});
