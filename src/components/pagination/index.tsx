import Pagination from './pagination';
import Base from '../base';

export { PaginationProps, PaginationConfig } from './pagination';

/* istanbul ignore next */
Pagination.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Pagination.name, Pagination);
};

export default Pagination;
