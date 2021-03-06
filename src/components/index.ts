// 导入颜色选择器组件
import VueIcon from '@/libs/icons-vue';
import moment from 'moment';
import zhCn from './moment-zh_CN';
import { App } from 'vue';
import Button from './button';
import Affix from './affix';
import Tree from './tree';
import Cascader from './cascader';
import Calendar from './calendar';
import Select from './select';
import Card from './card';
import Dropdown from './dropdown';
import Breadcrumb from './breadcrumb';
import Checkbox from './checkbox';
import DatePicker from './date-picker';
import Grid from './grid';
import Layout from './layout';
import Icon from './icon';
import Input from './input';
import Menu from './menu';
import Modal from './modal';
import Pagination from './pagination';
import Progress from './progress';
import Radio from './radio';
import Switch from './switch';
import Tabs from './tabs';
import Tag from './tag';
import Upload from './upload';
import './test';
// 注册moment中文国际化文案
if (window.moment) {
  window.moment.locale('zh-cn', zhCn);
} else {
  moment.locale('zh-cn', zhCn);
}
if (window.AntDesignIcons) {
  // 注册 ant design icons, 共721个icon
  const icons = window.AntDesignIcons;
  Object.keys(icons).forEach(icon => {
    VueIcon.add(icons[icon]);
  });
}
// 存储组件列表
const components = [
  Button,
	Affix,
	Tree,
	Cascader,
	Calendar,
	Select,
	Card,
	Dropdown,
	Breadcrumb,
	Checkbox,
	DatePicker,
	Grid,
	Layout,
	Icon,
	Input,
	Menu,
	Modal,
	Pagination,
	Progress,
	Radio,
	Switch,
	Tabs,
	Tag,
	Upload
];

// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install = function(app: App) {
  // 判断是否可以安装
  // if (install.installed) return
  // 遍历注册全局组件
  components.forEach(comp => app.use(comp));
};

export {
  // 以下是具体的组件列表
  Button,
	Affix,
	Tree,
	Cascader,
	Calendar,
	Select,
	Card,
	Dropdown,
	Breadcrumb,
	Checkbox,
	DatePicker,
	Grid,
	Layout,
	Icon,
	Input,
	Menu,
	Modal,
	Pagination,
	Progress,
	Radio,
	Switch,
	Tabs,
	Tag,
	Upload
};
export default {
  // 导出的对象必须具有 install，才能被 Vue.use() 方法安装
  install,
  Button,
	Affix,
	Tree,
	Cascader,
	Calendar,
	Select,
	Card,
	Dropdown,
	Breadcrumb,
	Checkbox,
	DatePicker,
	Grid,
	Layout,
	Icon,
	Input,
	Menu,
	Modal,
	Pagination,
	Progress,
	Radio,
	Switch,
	Tabs,
	Tag,
	Upload
};

