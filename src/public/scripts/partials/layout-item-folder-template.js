export function getFolderItem(folder) {
  const template = document.querySelector('#folder-item-template');
  const clone = template.content.firstElementChild.cloneNode(true);

  // 1. Add ID
  clone.id = `folder-${folder.id}`;

  // 1. add href
  clone.href = `/folders/${folder.id}`;

  // 2. add folder name
  clone.querySelector('.folder-name').textContent = folder.name;

  // 3. update button attributes
  const button = clone.querySelector('button');
  button.id = `folder-details-trigger-${folder.id}`;
  button.dataset.folder = JSON.stringify(folder);

  return clone;
}
