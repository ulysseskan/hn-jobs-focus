const container = document.querySelector("table.comment-tree");
const comments = container.querySelectorAll("tr.athing.comtr");
console.log(`${comments?.length} HN comments found`)

let values = {
  highlight: undefined,
  exclude: undefined
}

const getValuesFromStorage = async () => {
  chrome.storage.local.get(["highlight", "exclude"]).then((result) => {
    console.log("stored values:", result);

    values = result;
    applyHighlights(values);
  });
}

getValuesFromStorage();

const escapeRegExpString = (string) => {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// listen for updated values messages
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.newValues) {
    console.log("updated values:", message.newValues);
    clearAllHighlights();
    applyHighlights(message.newValues);
  }
});

// highlight comments
const applyHighlights = (values) => {
  if (container && comments) {
    let highlight, exclude;

    if (values["highlight"]) {
      highlight = escapeRegExpString(values["highlight"]);
    }

    if (values["exclude"]) {
      exclude = escapeRegExpString(values["exclude"]);
    }

    comments.forEach((commentElement) => {
      const commentText = commentElement.querySelector(".commtext")?.innerHTML;
      const highlightRegex = new RegExp(
        `(?<![[:alpha:]])${highlight}(?!:void)(?![[:alpha:]])`,
        "i"
      );
      const excludeRegex = new RegExp(
        `(?<![[:alpha:]])${exclude}(?![[:alpha:]])`,
        "i"
      );

      if (
        !!highlight && highlightRegex.test(commentText)
      ) {
        commentElement.classList.add("green-300-highlight");
      } else if (
        !!exclude && excludeRegex.test(commentText)
      ) {
        commentElement.classList.add("red-300-highlight");
      }
    });
  }
}

const clearAllHighlights = () => {
  const highlightedComments = document.querySelectorAll(
    ".green-300-highlight, .red-300-highlight"
  );
  highlightedComments.forEach((commentElement) => {
    commentElement.classList.remove("green-300-highlight");
    commentElement.classList.remove("red-300-highlight");
  });
}