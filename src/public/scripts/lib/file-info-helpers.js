export function handleShowFileInfo(file) {
  document.querySelector('#modal-file-name').textContent = file.originalName;
  document.querySelector('#modal-file-size').textContent = file.fileSize;
  document.querySelector('#modal-file-type').textContent = file.mimeType;
  document.querySelector('#modal-file-date').textContent = file.uploadedAt;

  if (file.mimeType.startsWith('image')) {
    document.querySelector('#modal-file-preview').innerHTML = `
    <img src="${file.publicUrl}" alt="File preview" />
  `;
  }
}
