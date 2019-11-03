// Category defaults constant
const DEFAULT_CATEGORY = {
  id: "UNKNOWN",
  title: "JSON ERROR: Title field not set!",
  sortOrder: 343,
  alts: [],
  nosearchhelp: false
}

// Archive defaults constant
const DEFAULT_ARCHIVE = {
  title: "JSON ERROR: Title field not set!",
  alts: [],
  href: "404.shtml",
  category: "Misc",
  releaseDate: "UNKNOWN",
  removalDate: "UNKNOWN",
  archivalDate: "UNKNOWN",
  thumb: "THUMBNAIL_MISSING.jpg"
};

// XMLHttpRequest constants
const READY_STATE_DONE = 4;
const STATUS_CODE_SUCCESS = 200;

// Global archives array
var archives = [];
var categories = {};

function onPageLoad() {
  // Immediately remove the no JS notice when this function calls, as JS is
  // evidently running if this function has been called
  document.getElementById("nojs").remove();

  // Create a HTTP request for the archives.json file
  request = new XMLHttpRequest();
  request.open("GET", "archives.json", true);
  request.setRequestHeader("Content-Type", "application/json");
  request.responseType = "json";

  // Set it to asynchronously build the list of archives once the request
  // returns a successful response
  request.onreadystatechange = function () {
    if (request.readyState === READY_STATE_DONE) {
      if (request.status === STATUS_CODE_SUCCESS) {
        interpretJsonData(request.response);
      } else {
        displayLoadFailureMessage();
      }
    }
  }

  // Send the request
  try {
    request.send();
  } catch (error) {
    displayLoadFailureMessage();
  }
}

function interpretJsonData(data) {
  // Extract the archives array into the global archives variable
  archives = data.archives;

  // Extract the categories object into the global categories variable
  categories = data.categories;

  // Generate necessary category HTML elements and extra information
  generateCategoryDataAndHtml();

  // Generate necessary archive HTML elements and extra information
  generateArchiveDataAndHtml();
}

function generateCategoryDataAndHtml() {
  // Loop through each of the category objects
  for (var id in categories) {
    // Get the relevant category object
    var category = categories[id];

    // Fill in any blanks in the archive info with the default info
    for (var key in DEFAULT_CATEGORY) {
      if (category[key] == null && category[key] !== false) {
        category[key] = DEFAULT_CATEGORY[key];
      }
    }

    // Add the key into the category object as the id
    category.id = id;

    // Add the id and title of the object to the alt names array
    category.alts.push(category.title, category.id);

    // Set the category to visible - this can be toggled by the filtering
    // options on the page
    category.visible = true;

    // Add the category to the list of filter options
    document.getElementById("options-advanced-filtersList").innerHTML +=
        buildCategoryFilterOption(category);
  }
}

function buildCategoryFilterOption(category) {
  return `
<li>
  <label>
    <input id="filter_${category.id}" class="options-advanced-input" type="checkbox" onclick="filterIndividual('${category.id}')" checked>
    <div class="label">${category.title}</div>
  </label>
</li>`;
}

function generateArchiveDataAndHtml() {
  // Find the archive list element, to which the list items must be appended
  var archiveList = document.getElementById("archiveList");

  // For each of the archives...
  for (var i = 0; i < archives.length; i++) {
    // Generate the necessary archive information
    generateArchiveInformation(archives[i]);

    // Add the archive title into the datalist, so that it appears as a
    // suggestion when the user types
    document.getElementById("archives").innerHTML +=
        `<option value="${archives[i].title}">${archives[i].title}</option>`;
  }

  // Apply the selected sorting option, filters and search term
  sortFilterAndSearch();
}

function generateArchiveInformation(archive) {
  // Fill in any blanks in the archive info with the default info
  for (var key in DEFAULT_ARCHIVE) {
    if (archive[key] == null) {
      archive[key] = DEFAULT_ARCHIVE[key];
    }
  }

  // Add the archive's title to its list of alternate names
  archive.alts.push(archive.title);

  // Generate an appropriate id from the archive's title by replacing all
  // whitespace with underscores
  archive.id = archive.title.replace(/\s+/g, "_");

  // Get the archive's category
  var category = categories[archive.category];

  // If the nosearchhelp field is not set to true on the archive's category,
  // generate additional alternate names for the search bar to check against,
  // by combining the name of the category with the alternate names already
  // given.
  if (!category.nosearchhelp) {
    // Extract the alts array from the archive object, and blank the object's
    // copy of it - since the search feature uses regexes, "ALT_NAME" is
    // superfluous when "CAT_NAME ALT_NAME" is already in the alt list
    var alts = archive.alts;
    archive.alts = [];

    // For every possible combination of "CAT_NAME" and "ALT_NAME", add both
    // "CAT_NAME ALT_NAME" and "ALT_NAME CAT_NAME" to the list of alternate
    // names - this will make it so that search terms such as "Halo 3 Believe"
    // still return the expected results despite not exactly matching the title
    for (var i = 0; i < alts.length; i++) {
      for (var j = 0; j < category.alts.length; j++) {
        archive.alts.push(alts[i] + ' ' + category.alts[j])
        archive.alts.push(category.alts[j] + ' ' + alts[i]);
      }
    }
  }

  // Set the archive to be visible - if an archive does not match the current
  // search query, it will be set to invisible
  archive.visible = true;

  // Generate the HTML for displaying the archive list item in the menu
  archive.html = buildArchiveListItem(archive);
}

function buildArchiveListItem(archive) {
  return `
<li class="cat_${archive.category} year_${archive.year}" id="id_${archive.id}" title="${archive.title}">
  <a href="${archive.href}">
    <div class="icon" style="background-image: url('images/icons/categories/${categories[archive.category].icon}')"></div>
    <div class="thumb" style="background-image: url('images/thumbnails/${archive.thumb}')"></div>
    <div class="title${archive.nocaps ? " nocaps" : ""}">${archive.title}</div>
    <div class="hover"></div>
  </a>
</li>`;
}

function displayLoadFailureMessage() {
  var archiveList = document.getElementById("archiveList");
  archiveList.innerHTML += `
<li id="loadfail" class="error">
  <p>There was an error loading the archive list! If this error persists, please contact a Halopedia administrator.</p>
</li>`;
}

function toggleAdvancedOptions() {
  var button = document.getElementById("options-simple-expand");
  var advOpts = document.getElementById("options-advanced");
  var icons = button.getElementsByTagName("img");
  if (advOpts.style.display == null || advOpts.style.display == "none") {
    button.getElementsByTagName("div")[0].innerHTML = "Hide Advanced Options";
    advOpts.style.display = "block";
    for (var i = 0; i < icons.length; i++) {
      icons[i].style.transform = "rotate(180deg)";
    }
  } else {
    button.getElementsByTagName("div")[0].innerHTML = "Show Advanced Options";
    advOpts.style.display = "none";
    for (var i = 0; i < icons.length; i++) {
      icons[i].style.transform = "rotate(0deg)";
    }
  }
}

function toggleSelectAll() {
  var checkbox = document.getElementById("filter_ALL");
  var enabled = checkbox.checked;
  if (checkbox.checked) {
    document.getElementById("filter_ALL-label").innerText = "(deselect all)";
  } else {
    document.getElementById("filter_ALL-label").innerText = "(select all)";
  }
  for (id in categories) {
    document.getElementById("filter_" + id).checked = enabled;
  }
  filter();
}

function sortFilterAndSearch() {
  filterOnly();
  searchOnly();
  sort();
  showVisible();
}

function search() {
  searchOnly();
  showVisible();
}

function filter() {
  filterOnly();
  showVisible();
}

function filterIndividual(id) {
  categories[id].visible = document.getElementById("filter_" + id).checked;
  showVisible();
  var allVisible = true;
  var allInvisible = true;
  for (var id in categories) {
    if (categories[id].visible) {
      allInvisible = false;
    } else {
      allVisible = false;
    }
  }
  if (allVisible) {
    document.getElementById("filter_ALL-label").innerText = "(deselect all)";
    document.getElementById("filter_ALL").checked = true;
  } else if (allInvisible) {
    document.getElementById("filter_ALL-label").innerText = "(select all)";
    document.getElementById("filter_ALL").checked = false;
  }
}

if (checkbox.checked) {
  document.getElementById("filter_ALL-label").innerText = "(deselect all)";
} else {
  document.getElementById("filter_ALL-label").innerText = "(select all)";
}

function filterOnly() {
  for (var id in categories) {
    categories[id].visible = document.getElementById("filter_" + id).checked;
  }
}

function searchOnly() {
  var regex = getSearchQueryRegex();
  for (var i = 0; i < archives.length; i++) {
    archives[i].visible = false;
    for (var j = 0; j < archives[i].alts.length; j++) {
      if (regex.test(archives[i].alts[j])) {
        archives[i].visible = true;
        break;
      }
    }
  }
}

function getSearchQueryRegex() {
  // Get the current string value of the search bar
  var text = document.getElementById("options-simple-search").value;

  // Strip out any leading or trailing whitespace
  text = text.replace(/(^\s+)(\s+$)/g, "");

  // Condense any repeated whitespace into a single space
  text = text.replace(/\s+/g, " ");

  // Return a case insensitive regex
  return new RegExp(text, "i");
}

function showVisible() {
  var found = false;
  for (i = 0; i < archives.length; i++) {
    var domObject = document.getElementById("id_" + archives[i].id);
    if (archives[i].visible
        && categories[archives[i].category].visible) {
      domObject.style.display = "inline-block";
      found = true;
    } else {
      domObject.style.display = "none";
    }
  }
  if (found) {
    document.getElementById("noresults").style.display = "none";
  } else {
    document.getElementById("noresults").style.display = "inline-block";
  }
}

function sort() {
  var type = document.querySelector('input[name="sortType"]:checked').value;
  var ascending = document.querySelector('input[name="sortDirection"]:checked')
      .value === "asc";
  var func = null;

  var ascLabel = document.getElementById("sort-ascending-label");
  var descLabel = document.getElementById("sort-descending-label");

  switch (type) {
    case "alphanumeric":
      ascLabel.innerText = "Ascending (A to Z)";
      descLabel.innerText = "Descending (Z to A)";
      break;
    case "releaseDate":
    case "removalDate":
    case "archivalDate":
      ascLabel.innerText = "Ascending (old to new)";
      descLabel.innerText = "Descending (new to old)";
      break;
    default:
      ascLabel.innerText = "Ascending";
      descLabel.innerText = "Descending";
      break;
  }
  
  switch (type) {
    case "alphanumeric":
      func = function (a, b) {
        return ascending ? a.title.toLowerCase() > b.title.toLowerCase()
            : a.title.toLowerCase() < b.title.toLowerCase();
      };
      break;
    case "category":
      func = function (a, b) {
        catA = categories[a.category];
        catB = categories[b.category];
        if (catA.sortOrder == catB.sortOrder) {
          return a.title.toLowerCase() > b.title.toLowerCase();
        }
        return ascending ? catA.sortOrder > catB.sortOrder
            : catA.sortOrder < catB.sortOrder;
      };
      break;
    case "releaseDate":
      func = function (a, b) {
        if (a.releaseDate == b.releaseDate) {
          return a.title.toLowerCase() > b.title.toLowerCase();
        }
        return ascending ? a.releaseDate > b.releaseDate : a.releaseDate < b.releaseDate;
      };
      break;
    case "removalDate":
      func = function (a, b) {
        if (a.removalDate == b.removalDate) {
          return a.title.toLowerCase() > b.title.toLowerCase();
        }
        return ascending ? a.removalDate > b.removalDate : a.removalDate < b.removalDate;
      };
      break;
    case "archivalDate":
      func = function (a, b) {
        if (a.archivalDate == b.archivalDate) {
          return a.title.toLowerCase() > b.title.toLowerCase();
        }
        return ascending ? a.archivalDate > b.archivalDate : a.archivalDate < b.archivalDate;
      };
      break;
    default:
      console.log(`ERROR: Unrecognised sort type: "${type}"`);
      break;
  }

  sortArchiveList(func);

  document.getElementById("archiveList").innerHTML = archives.map(a => a.html).join("");
  document.getElementById("archiveList").innerHTML += `
<li id="noresults" class="error" style="display:none;">
  <p>No results were found for your search query! We might have the site you're looking for archived under a different name. If we don't have it at all and you believe we should, please contact a Halopedia administrator!</p>
</li>`;
}

function sortArchiveList(compare) {
  do {
    var switched = false;
    for (i = 0; i < archives.length - 1; i++) {
      if (compare(archives[i], archives[i + 1])) {
        var carry = archives[i];
        archives[i] = archives[i + 1];
        archives[i + 1] = carry;
        switched = true;
      }
    }
  } while (switched);
}