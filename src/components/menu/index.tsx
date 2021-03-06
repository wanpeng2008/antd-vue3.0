import {getComponentFromContext} from '@/components/_util/props-util';
import {cloneElement} from '@/components/_util/vnode';
import {ProvideKeys} from '@/components/menu/utils';
import {useLocalValue} from '@/tools/value';
import {ComponentInternalInstance} from '@vue/runtime-core';
import omit from 'omit.js';
import {
  App,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onUpdated,
  provide,
  reactive,
  ref,
  VNode,
  watch,
  cloneVNode
} from 'vue';
import animation from '../_util/openAnimation';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {ConfigConsumerProps} from '../config-provider';
import Divider from './divider';
import Item, {MenuItemInfo} from './menu-item';
import ItemGroup from './menu-item-group';
import './style';
import SubMenu from './sub-menu';


// import raf from '../_util/raf';


export interface IMenuContext {
  itemIcon?: VNode | string;
  multiple: boolean;
  getMode: () => string;
  getHoverKey: () => string;
  setHoverItem: (key: string) => void;
  removeHoverItem: (key: string) => void;
  instance: ComponentInternalInstance;
  openTransitionName: string;
  triggerSubMenuAction: string;
  getSelectedKeys: () => string[];
  openAnimation: any;
  getTheme: () => 'light' | 'dark';
  getOpenKeys: () => any[];
  rootPrefixCls: string;
  inlineIndent: number;
  getInlineCollapsed: () => boolean;
  activeMenu: (info: MenuItemInfo) => void;
  deactiveMenu: (info: MenuItemInfo) => void;
  onMenuClick: (info) => any;
}


export const useMenuContext: () => IMenuContext = () => {
  return inject(ProvideKeys.MenuContext) || {
    multiple: false,
    openAnimation: null,
    setHoverItem: (key) => {
    },
    getMode: () => 'inline',
    removeHoverItem: (key) => {
    },
    getHoverKey: () => undefined,
    getSelectedKeys: () => [],
    rootPrefixCls: 'ant-menu',
    openTransitionName: 'slide-up',
    triggerSubMenuAction: 'click',
    itemIcon: null,
    activeMenu: (info) => {
    },
    deactiveMenu: (info) => {
    },
    inlineIndent: 24,
    onMenuClick: (info) => {
    },
    getTheme: () => 'light'
  } as IMenuContext;
};

export const MenuMode = PropTypes.oneOf([
  'vertical',
  'vertical-left',
  'vertical-right',
  'horizontal',
  'inline'
]);

export const menuProps = {
  prefixCls: PropTypes.string.def('ant-menu'),
  focusable: PropTypes.bool.def(true),
  multiple: PropTypes.bool,
  defaultActiveFirst: PropTypes.bool,
  visible: PropTypes.bool.def(true),
  activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  defaultSelectedKeys: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).def([]),
  defaultOpenKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).def(
      []
  ),
  openKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  openAnimation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  mode: PropTypes.oneOf([
    'horizontal',
    'vertical',
    'vertical-left',
    'vertical-right',
    'inline'
  ]).def('vertical'),
  triggerSubMenuAction: PropTypes.string.def('hover'),
  subMenuOpenDelay: PropTypes.number.def(0.1),
  subMenuCloseDelay: PropTypes.number.def(0.1),
  level: PropTypes.number.def(1),
  inlineIndent: PropTypes.number.def(24),
  theme: PropTypes.oneOf(['light', 'dark']).def('light'),
  getPopupContainer: PropTypes.func,
  openTransitionName: PropTypes.string.def('slide-up'),
  uniqueOpen: PropTypes.bool.def(false),
  forceSubMenuRender: PropTypes.bool,
  isRootMenu: PropTypes.bool.def(true),
  builtinPlacements: PropTypes.object.def(() => ({})),
  itemIcon: PropTypes.any,
  expandIcon: PropTypes.any,
  overflowedIndicator: PropTypes.any,
  selectable: PropTypes.bool.def(true),
  inlineCollapsed: PropTypes.bool
};

const Menu = defineComponent({
  name: 'AMenu',
  props: menuProps,
  setup(props, {emit}) {
    const layoutSiderContext: any = inject('layoutSiderContext') || {};
    const getInlineCollapsed = () => {
      const {inlineCollapsed} = props;
      if (layoutSiderContext.sCollapsed !== undefined) {
        return layoutSiderContext.sCollapsed;
      }
      return inlineCollapsed;
    };
    const propsUpdating = ref(false);
    onUpdated(() => {
      propsUpdating.value = false;
    });
    const switchingModeFromInline = ref(false);
    watch(() => props.mode, (val: string, oldVal: string) => {
      if (oldVal === 'inline' && val !== 'inline') {
        switchingModeFromInline.value = true;
      }
    });
    const {value: openKeys, getValue: getOpenKeys, setValue: setOpenKeys} = useLocalValue(props.defaultOpenKeys, 'openKeys');
    const inlineOpenKeys = ref([] as string[]);
    const collapsedChange = (val) => {
      if (propsUpdating.value) {
        return;
      }
      propsUpdating.value = true;
      if (props.openKeys === undefined) {
        if (val) {
          switchingModeFromInline.value = true;
          inlineOpenKeys.value = openKeys.value;
          openKeys.value = [];
        } else {
          openKeys.value = inlineOpenKeys.value;
          inlineOpenKeys.value = [];
        }
      } else if (val) {
        // 缩起时，openKeys置为空的动画会闪动，react可以通过是否传递openKeys避免闪动，vue不是很方便动态传递openKeys
        switchingModeFromInline.value = true;
      }
    };
    const restoreModeVerticalFromInline = () => {
      if (switchingModeFromInline.value) {
        switchingModeFromInline.value = false;
      }
    };
    const handleMouseEnter = (e) => {
      restoreModeVerticalFromInline();
      emit('mouseenter', e);
    };
    watch(() => props.inlineCollapsed, val => {
      collapsedChange(val);
    });
    watch(() => layoutSiderContext.sCollapsed, (val) => {
      collapsedChange(val);
    });
    const handleTransitionEnd = (e) => {
      // when inlineCollapsed menu width animation finished
      // https://github.com/ant-design/ant-design/issues/12864
      const widthCollapsed = e.propertyName === 'width' && e.target === e.currentTarget;

      // Fix SVGElement e.target.className.indexOf is not a function
      // https://github.com/ant-design/ant-design/issues/15699
      const {className} = e.target;
      // SVGAnimatedString.animVal should be identical to SVGAnimatedString.baseVal, unless during an animation.
      const classNameValue =
          Object.prototype.toString.call(className) === '[object SVGAnimatedString]'
              ? className.animVal
              : className;

      // Fix for <Menu style={{ width: '100%' }} />, the width transition won't trigger when menu is collapsed
      // https://github.com/ant-design/ant-design-pro/issues/2783
      const iconScaled = e.propertyName === 'font-size' && classNameValue.indexOf('anticon') >= 0;

      if (widthCollapsed || iconScaled) {
        restoreModeVerticalFromInline();
      }
    };
    const handleClick = (e) => {
      handleOpenChange([]);
      emit('click', e);
    };
    const handleSelect = (info) => {
      emit('select', info);
      emit('selectChange', info.selectedKeys);
    };
    const handleDeselect = (info) => {
      emit('deselect', info);
      emit('selectChange', info.selectedKeys);
    };
    const handleOpenChange = (event) => {
      let tmpOpenKeys = [].concat(getOpenKeys());
      let openedKeys: string[] = [];
      let removedKey: string = null;
      if (Array.isArray(event)) {
        if (event[event.length - 1].open) {
          openedKeys = event.map(it => it.key);
        } else {
          openedKeys = event.filter(it => it.open).map(it => it.key);
        }
        removedKey = event[event.length - 1].open ? null : event[event.length - 1].key;
      } else {
        openedKeys = event.open ? [event.key] : [];
        removedKey = event.open ? null : event.key;
      }
      if (props.uniqueOpen) {
        tmpOpenKeys = openedKeys;
      } else {
        openedKeys.forEach(key => {
          if (!tmpOpenKeys.includes(key)) {
            tmpOpenKeys.push(key);
          }
        });
        if (tmpOpenKeys.includes(removedKey)) {
          tmpOpenKeys.splice(tmpOpenKeys.indexOf(removedKey), 1);
        }
      }
      setOpenKeys(tmpOpenKeys);
      emit('openChange', tmpOpenKeys);
    };
    const getRealMenuMode = () => {
      const inlineCollapsed = getInlineCollapsed();
      const {mode} = props;
      return inlineCollapsed ? 'vertical' : mode;
    };
    const getMenuOpenAnimation = (menuMode) => {
      const {openAnimation, openTransitionName} = props;
      let menuOpenAnimation = openAnimation || openTransitionName;
      if (openAnimation === undefined && openTransitionName === undefined) {
        if (menuMode === 'horizontal') {
          menuOpenAnimation = 'slide-up';
        } else if (menuMode === 'inline') {
          menuOpenAnimation = {on: animation};
        } else {
          // When mode switch from inline
          // submenu should hide without animation
          if (switchingModeFromInline) {
            menuOpenAnimation = '';
            switchingModeFromInline.value = false;
          } else {
            menuOpenAnimation = 'zoom-big';
          }
        }
      }
      return menuOpenAnimation;
    };
    const {value: selectedKeys, setValue: setSelectedKeys} = useLocalValue(props.defaultSelectedKeys, 'selectedKeys');
    const onSelect = (info: MenuItemInfo) => {
      if (props.selectable) {
        // root menu
        let tmpSelectedKeys = selectedKeys.value;
        const selectedKey = info.key;
        if (props.multiple) {
          tmpSelectedKeys = tmpSelectedKeys.concat([selectedKey]);
        } else {
          tmpSelectedKeys = [selectedKey];
        }
        setSelectedKeys(tmpSelectedKeys);
        emit('select', {
          ...info,
          selectedKeys: tmpSelectedKeys
        });
      }
    };
    const onDeselect = (info: MenuItemInfo) => {
      if (props.selectable) {
        const tmpSelectedKeys = selectedKeys.value;
        const selectedKey = info.key;
        const index = tmpSelectedKeys.indexOf(selectedKey);
        if (index !== -1) {
          tmpSelectedKeys.splice(index, 1);
        }
        if (props.selectedKeys === undefined) {
          setSelectedKeys(tmpSelectedKeys);
        }
        emit('deselect', {
          ...info,
          selectedKeys: tmpSelectedKeys
        });
      }
    };
    const instance = getCurrentInstance();
    const hoverKey = ref(undefined);
    const menuContext = reactive<IMenuContext>({
      openAnimation: props.openAnimation,
      instance,
      getHoverKey() {
        return hoverKey.value;
      },
      getOpenKeys,
      multiple: props.multiple,
      getMode: getRealMenuMode,
      getTheme: () => props.theme,
      itemIcon: props.itemIcon,
      rootPrefixCls: props.prefixCls,
      getInlineCollapsed: () => props.inlineCollapsed,
      inlineIndent: props.inlineIndent,
      openTransitionName: props.openTransitionName,
      triggerSubMenuAction: props.triggerSubMenuAction,
      setHoverItem: (key) => {
        hoverKey.value = key;
      },
      removeHoverItem: (key) => {
        if (hoverKey.value === key) {
          hoverKey.value = null;
        }
      },
      activeMenu: (menu: MenuItemInfo) => {
        onSelect(menu);
      },
      deactiveMenu: (menu: MenuItemInfo) => {
        onDeselect(menu);
      },
      getSelectedKeys: () => {
        return selectedKeys.value;
      },
      onMenuClick: (info) => {
        emit('click', info);
      }
    });
    watch(() => props, (value) => {
      menuContext.multiple = value.multiple;
      menuContext.openAnimation = props.openAnimation;
      menuContext.inlineIndent = props.inlineIndent;
      menuContext.rootPrefixCls = props.prefixCls;
      menuContext.openTransitionName = props.openTransitionName;
      menuContext.triggerSubMenuAction = props.triggerSubMenuAction;
      menuContext.itemIcon = props.itemIcon;
    }, {deep: true});
    if (!inject(ProvideKeys.MenuContext)) {
      provide(ProvideKeys.MenuContext, menuContext);
    }
    const configProvider: any = inject('configProvider') || ConfigConsumerProps;
    return {
      handleSelect,
      handleClick,
      handleOpenChange,
      handleMouseEnter,
      handleDeselect,
      handleTransitionEnd,
      layoutSiderContext,
      openKeys,
      getInlineCollapsed,
      getMenuOpenAnimation,
      getRealMenuMode,
      configProvider,
      onKeyDown(e, callback) {
        // this.$refs.innerMenu.getWrappedInstance().onKeyDown(e, callback);
      }
    };
  },
  render(ctx) {
    const {$slots: slots, $props: props} = this;
    const {collapsedWidth} = ctx.layoutSiderContext;
    const {getPopupContainer: getContextPopupContainer} = this.configProvider;
    const {prefixCls: customizePrefixCls, getPopupContainer} = this.$props;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('menu', customizePrefixCls);
    const menuMode = this.getRealMenuMode();
    const menuOpenAnimation = this.getMenuOpenAnimation(menuMode);

    const menuProps = {
      ...omit(this.$props, ['inlineCollapsed']),
      getPopupContainer: getPopupContainer || getContextPopupContainer,
      openKeys: this.openKeys,
      mode: menuMode,
      prefixCls,
      selectedKeys: props.selectedKeys,
      openAnimation: props.openAnimation,
      openTransitionName: props.openTransitionName,
      onClick: props['onClick'],
      onSelect: this.handleSelect,
      onDeselect: this.handleDeselect,
      onOpenChange: this.handleOpenChange,
      onMouseenter: this.handleMouseEnter,
      onTransitionend: this.handleTransitionEnd
    };
    if (props.selectedKeys === undefined) {
      delete menuProps.selectedKeys;
    }

    if (menuMode === 'inline') {
      menuProps.onClick = e => {
        this.$emit('click', e);
      };
      menuProps.openAnimation = menuOpenAnimation;
    } else {
      // closing vertical popup submenu after click it
      menuProps.onClick = this.handleClick;
      menuProps.openTransitionName = menuOpenAnimation;
    }
    // https://github.com/ant-design/ant-design/issues/8587
    const hideMenu =
        this.getInlineCollapsed() &&
        (collapsedWidth === 0 || collapsedWidth === '0' || collapsedWidth === '0px');
    if (hideMenu) {
      menuProps.openKeys = [];
    }
    const menuClasses = {
      [prefixCls]: true,
      [`${prefixCls}-${this.getRealMenuMode()}`]: true,
      [`${prefixCls}-inline-collapsed`]: this.getInlineCollapsed(),
      [`${prefixCls}-root`]: this.isRootMenu,
      [`${prefixCls}-${this.$props.theme}`]: true
    };
    const childProps: any = {
      rootPrefixCls: this.prefixCls,
      onOpenChange: this.handleOpenChange
    };
    const expandIcon = getComponentFromContext(this, 'expandIcon', props);
    if (expandIcon) {
      // todo
      // childProps.expandIcon = expandIcon;
    }
    const children = (slots.default && slots.default() || [])
        .map(child => {
          return cloneVNode(child, childProps);
        });
    return (
        <ul role="menu" class={menuClasses}>
          {children}
        </ul>
    );
  }
});

Menu.Divider = Divider;
Menu.ItemGroup = ItemGroup;
Menu.Item = Item;
Menu.SubMenu = SubMenu;

/* istanbul ignore next */
Menu.install = function(app: App) {
  app.use(Base);
  app.component(Menu.name, Menu);
  app.component(Menu.Item.name, Menu.Item);
  app.component(Menu.SubMenu.name, Menu.SubMenu);
  app.component(Menu.Divider.name, Menu.Divider);
  app.component(Menu.ItemGroup.name, Menu.ItemGroup);
};
export default Menu as any;
