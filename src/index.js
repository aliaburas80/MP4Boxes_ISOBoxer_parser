let objectTree = {};
const TYPES = {
  BOX_SIZE: "boxSize",
  DATA: "data",
  OBJECT_TREE: "objectTree",
};
// to write console.
const logData = (type, data) => {
  switch (type) {
    case TYPES.BOX_SIZE:
      console.log(
        `%cFound Box of type %c${data.type} and size %c${data.size}`,
        "color:#f54949; font-size:20;",
        "color:#99ffff; font-size:18px;fontWight:bold text-transform:uppercase;",
        "color:#ffff99; font-size:18px;"
      );
      break;
    case TYPES.DATA:
      console.log(
        `%cContent of mdat box is %c${data.split("mdat")[1]}`,
        "color:#99ffff; text-transform:uppercase; font-size:18px;fontWight:bold",
        "color:#ffff99; font-size:18px;"
      );
      break;
    case TYPES.OBJECT_TREE:
      console.log(
        "%cObject Tree = ",
        "color:#99ffff; text-transform:uppercase; font-size:18px;fontWight:bold"
      );
      console.log(data);
      break;
    default:
      console.log(`------------------------------------------`);
      console.log(`------------------------------------------`);
      console.log(`-----------------{ ${data} }-----------------`);
      console.log(`------------------------------------------`);
      console.log(`------------------------------------------`);
      break;
  }
};

// create object with all boxes sizes and types
const findNestedObj = (entireObj, keyToFind, valToFind) => {
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind] === valToFind) {
      foundObj = nestedValue;
    }
    return nestedValue;
  });
  return foundObj;
};

const createBoxesObjTree = (obj, mdata) => {
  if (obj._parent.type) {
    let childNode = findNestedObj(objectTree, "type", obj._parent.type);
    if (childNode) {
      childNode[obj.type] = {
        [obj.type]: {
          type: obj.type,
          size: obj.size,
        },
      };
    }
  } else if (mdata) {
    objectTree[obj?.type] = {
      type: obj?.type,
      mdata: mdata,
    };
  } else {
    objectTree[obj?.type] = {
      type: obj?.type,
      size: obj?.size,
    };
  }
};

// draw images on html
const drawImages = (data) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data.split("mdat")[1], "application/xml");
  var imgTags = doc.getElementsByTagName("smpte:image");
  for (const key in imgTags) {
    if (Object.hasOwnProperty.call(imgTags, key)) {
      var img = document.createElement("img");
      img.src = `data:image/jpeg;base64,${imgTags[key].innerHTML}`;
      document.getElementById("image_container").appendChild(img);
    }
  }
};

// load MP4 file using axios, then parse buffer array using ISOBoxer to get all boxes from the media file
const loadMP4File = (url) => {
  logData("", url);
  this.axios({
    url,
    method: "GET",
    responseType: "blob",
  }).then((res) => {
    const blob = new Blob([res.data]);
    blob.arrayBuffer().then((buffer) => {
      objectTree = {};
      extractBoxes(ISOBoxer.parseBuffer(buffer).boxes);
      logData(TYPES.OBJECT_TREE, objectTree);
    });
  });
};

// extract each boxes and its children
const extractBoxes = (boxes) => {
  boxes.forEach((element) => {
    parent = this;
    checkBoxesChildren(element);
  });
};

const checkBoxesChildren = (box) => {
  if (box.boxes) {
    logData(TYPES.BOX_SIZE, box);
    createBoxesObjTree(box);
    extractBoxes(box.boxes);
  } else {
    const data = ISOBoxer.Utils.dataViewToString(box._raw, "utf-8");
    if (box.type === "mdat") {
      logData(TYPES.DATA, data);
      createBoxesObjTree(box, data);
      drawImages(data);
    } else {
      createBoxesObjTree(box);
      logData(TYPES.BOX_SIZE, box);
    }
  }
};
// load media files
loadMP4File("https://demo.castlabs.com/tmp/text0.mp4");
//for large boxes it took a long time to parse, may affect performance
// loadMP4File(
//   "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4"
// );
