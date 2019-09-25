var archives = [];

// This function is called when body finishes loading.
function onPageLoad() {
  // Immediately remove the no JS notice when this function calls, as JS is
  // evidently running if this function has been called.
  document.getElementById("nojs").remove();
}

function generateList(json) {
  archives = JSON.parse(json);
}

function toggleAdvancedOptions() {
  button = document.getElementById("options-simple-expand");
  advOpts = document.getElementById("options-advanced");
  if (advOpts.style.display == null || advOpts.style.display == "none") {
    button.innerHTML = "Hide Advanced Options";
    advOpts.style.display = "block";
  } else {
    button.innerHTML = "Show Advanced Options";
    advOpts.style.display = "none";
  }
}

function search() {
  regex = new RegExp(document.getElementById("options-simple-search").value, 'i');
  archives = document.getElementById("archive-list").getElementsByTagName("li");
  found = false;
  for (var i = 0; i < archives.length; i++) {
    if (regex.test(archives[i].title)) {
      archives[i].style.display = "inline-block";
      found = true;
    } else {
      archives[i].style.display = "none";
    }
  }
  if (found) {
    document.getElementById("noresults").style.display = "none";
  } else {
    document.getElementById("noresults").style.display = "inline-block";
  }
}

function updateListSearchAndFilters() {

}

function updateListSorting() {

}