const tabinator = {};

tabinator.tabs = [];
tabinator.leaves = [];

tabinator.generateRoot = function(){
  const root = document.createElement("div");
  root.classList.add("tabinator-root");
  return root;
}
tabinator.init = function(root) {
  tabinator.root = root;

  tabinator.leafContainer = document.createElement("div");
  tabinator.leafContainer.classList.add("tabinator-leaves-container");
  tabinator.root.appendChild(tabinator.leafContainer);

  tabinator.tabContainer = document.createElement("div");
  tabinator.tabContainer.classList.add("tabinator-tabs-container");
  tabinator.root.appendChild(tabinator.tabContainer);
}

tabinator.newTab = function(tabName) {
  const leaf = document.createElement("div");
  leaf.classList.add("tabinator-leaf");
  leaf.innerText = tabName;
  tabinator.leaves[tabinator.leaves.length] = leaf;
  tabinator.leafContainer.appendChild(leaf);
  leaf.addEventListener("pointerup", tabinator.selectTab);

  const tab = document.createElement("div");
  tab.classList.add("tabinator-tab");
  tabinator.tabs[tabinator.tabs.length] = tab;
  tabinator.tabContainer.appendChild(tab);

  if (!tabinator.selectedTab) tabinator.showTab(0);

  return tab;
}
tabinator.showTab = function(idx) {
  tabinator.selectedTab = tabinator.tabs[idx];
  tabinator.selectedLeaf = tabinator.leaves[idx];
  tabinator.selectedTab.classList.add("tabinator-tab-selected");
  tabinator.selectedLeaf.classList.add("tabinator-leaf-selected");
}
tabinator.hideTab = function() {
  tabinator.selectedTab.classList.remove("tabinator-tab-selected");
  tabinator.selectedLeaf.classList.remove("tabinator-leaf-selected");
  tabinator.selectedTab = null;
  tabinator.selectedLeaf = null;
}
tabinator.selectTab = function() {
  // this == leaf (HTMLDivElement)
  tabinator.hideTab();
  tabinator.showTab(tabinator.leaves.indexOf(this));
}
tabinator.autoSetup = function(parent) {
  const root = tabinator.generateRoot();
  parent.appendChild(root);
  tabinator.init(root);
  return root;
}
