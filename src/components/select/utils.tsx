import {VNode} from 'vue';
import {getAttrs, getPropsData, getSlotOptions} from '../_util/props-util';


export function getAlignFromPlacement(builtinPlacements, placementStr, align?) {
  const baseAlign = builtinPlacements[placementStr] || {};
  return {
    ...baseAlign,
    ...align
  };
}

export function toTitle(title) {
  if (typeof title === 'string') {
    return title.trim();
  }
  return '';
}

export function getValuePropValue(child: VNode) {
  if (!child) {
    return null;
  }
  return child.props?.value;
}

export function getPropValue(child: VNode, prop = 'value') {
  if (prop === 'value') {
    return getValuePropValue(child);
  }
  if (prop === 'children') {
    const newChild = child.children;
    if (Array.isArray(newChild) && newChild.length === 1 && typeof newChild[0] === 'string') {
      return newChild[0];
    } else if (typeof newChild === 'object' && newChild['default']) {
      return newChild['default']();
    }
    return newChild;
  }
  const data = getPropsData(child);
  if (prop in data) {
    return data[prop];
  } else {
    return getAttrs(child)[prop];
  }
}

export function isMultiple(props) {
  return props.mode === 'multiple';
}

export function isCombobox(props) {
  return props.mode === 'combobox';
}

export function isMultipleOrTags(props) {
  return props.mode === 'multiple' || props.mode === 'tags';
}

export function isMultipleOrTagsOrCombobox(props) {
  return isMultipleOrTags(props) || isCombobox(props);
}

export function isSingleMode(props) {
  return !isMultipleOrTagsOrCombobox(props);
}

export function toArray(value) {
  let ret = value;
  if (value === undefined) {
    ret = [];
  } else if (!Array.isArray(value)) {
    ret = [value];
  }
  return ret;
}

export function getMapKey(value) {
  return `${typeof value}-${value}`;
}

export function preventDefaultEvent(e) {
  e.preventDefault();
}

export function findIndexInValueBySingleValue(value, singleValue) {
  let index = -1;
  if (value) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] === singleValue) {
        index = i;
        break;
      }
    }
  }
  return index;
}

export function getLabelFromPropsValue(value, key) {
  let label;
  const copyValue = toArray(value);
  if (copyValue) {
    for (let i = 0; i < copyValue.length; i++) {
      if (copyValue[i].key === key) {
        label = copyValue[i].label;
        break;
      }
    }
  }
  return label;
}

export function getSelectKeys(menuItems, value) {
  if (value === null || value === undefined) {
    return [];
  }
  let selectedKeys = [];
  menuItems.forEach(item => {
    if (getSlotOptions(item).isMenuItemGroup) {
      selectedKeys = selectedKeys.concat(getSelectKeys(item.componentOptions.children, value));
    } else {
      const itemValue = getValuePropValue(item);
      const itemKey = item.key;
      if (findIndexInValueBySingleValue(value, itemValue) !== -1 && itemKey !== undefined) {
        selectedKeys.push(itemKey);
      }
    }
  });
  return selectedKeys;
}

export const UNSELECTABLE_STYLE = {
  userSelect: 'none'
};

export const UNSELECTABLE_ATTRIBUTE = {
  unselectable: 'on'
};

export function findFirstMenuItem(children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const props = getPropsData(child);
    if (getSlotOptions(child).isMenuItemGroup) {
      const found = findFirstMenuItem(child.componentOptions.children);
      if (found) {
        return found;
      }
    } else if (!props.disabled) {
      return child;
    }
  }
  return null;
}

export function includesSeparators(str, separators) {
  for (let i = 0; i < separators.length; ++i) {
    if (str.lastIndexOf(separators[i]) > 0) {
      return true;
    }
  }
  return false;
}

export function splitBySeparators(str, separators) {
  const reg = new RegExp(`[${separators.join()}]`);
  return str.split(reg).filter(token => token);
}

export function validateOptionValue(value, props) {
  if (isSingleMode(props) || isMultiple(props)) {
    return;
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(
        `Invalid \`value\` of type \`${typeof value}\` supplied to Option, ` +
        `expected \`string\` when \`tags/combobox\` is \`true\`.`
    );
  }
}

export function saveRef(instance, name) {
  return node => {
    instance[name] = node;
  };
}

export function generateUUID() {
  if (process.env.NODE_ENV === 'test') {
    return 'test-uuid';
  }
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
  });
  return uuid;
}

export function isHidden(node) {
  return !node || node.offsetParent === null;
}
