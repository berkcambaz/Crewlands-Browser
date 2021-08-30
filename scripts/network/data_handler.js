function DataHandler() {
  let buffer = "";
  this.delimiter = "\n"
  const chunkSize = 4096;

  this.push = function (data) {
    buffer += data;
  }

  this.getData = function () {
    const delimiterIndex = buffer.indexOf(this.delimiter)
    if (delimiterIndex !== -1) {
      const data = buffer.substring(0, delimiterIndex)
      buffer = buffer.substring(delimiterIndex + this.delimiter.length)
      return JSON.parse(data);
    }

    return undefined;
  }

  this.chunk = function (data) {
    const chunkCount = Math.ceil(data.length / chunkSize);
    const chunks = [];

    for (let i = 0, s = 0; i < chunkCount; ++i, s += chunkSize)
      chunks[i] = data.substr(s, chunkSize);

    return chunks;
  }
}

export const dataHandler = new DataHandler();