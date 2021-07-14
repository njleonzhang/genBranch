const fs = require('fs');
const path = require('path');

let defaultCacheFile = path.resolve(__dirname, './.cache');

const TYPE_JSON = 'json';
const TYPE_STR = 'str';

class FileCache {
  constructor(cacheFie) {
    this.cacheFie = cacheFie;
    this.memoCache = null;
  }

  // 存 string 到文件
  strSet(payload) {
    try {
      fs.writeFileSync(this.cacheFie, payload);
    } catch (err) {
      return;
    }
  }

  // 文件中读取 string
  strGet() {
    try {
      const content = fs.readFileSync(this.cacheFie, { encoding: 'utf8' });
      return content;
    } catch (err) {
      return
    }
  }

  // 应该被子类复写
  value2Str(value) {
    return value;
  }

  // 应该被子类复写
  str2Value(str) {
    return str;
  }

  // 带内存缓存的 set
  set(payload) {
    this.memoCache = payload;
    this.strSet(this.value2Str(payload));
  }

  // 带内存缓存的 get
  get() {
    if (!this.memoCache) {
      this.memoCache = this.str2Value(this.strGet());
    }

    return this.memoCache;
  } 
}

class JSONFileCache extends FileCache {
  value2Str(value) {
    if (value) {
      return JSON.stringify(value);
    } else {
      return '';
    }
  }

  str2Value(str) {
    try {
      let json = JSON.parse(str);
      return json;
    } catch {
      return {};
    }
  }

  setValue(key, value) {
    let json = this.get();
    json[key] = value;
    this.set(json);
  }

  getValue(key) {
    let json = this.get();
    return json[key];
  }
}

function createFileCache(type, cacheFile = defaultCacheFile) {
  if (type === TYPE_JSON) {
    return new JSONFileCache(cacheFile);
  }

  return new FileCache(cacheFile);
}

exports.TYPE_JSON = TYPE_JSON;
exports.createFileCache = createFileCache;