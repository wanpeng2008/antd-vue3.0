import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {defineComponent} from 'vue';
import {initDefaultProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import {Button, Group} from '../radio';
import Select from '../select';

const {Option} = Select;

function getMonthsLocale(value) {
  const current = value.clone();
  const localeData = value.localeData();
  const months = [];
  for (let i = 0; i < 12; i++) {
    current.month(i);
    months.push(localeData.monthsShort(current));
  }
  return months;
}

export const HeaderProps = {
  prefixCls: PropTypes.string,
  locale: PropTypes.any,
  fullscreen: PropTypes.boolean,
  yearSelectOffset: PropTypes.number,
  yearSelectTotal: PropTypes.number,
  type: PropTypes.string,
  // onValueChange: PropTypes.(value: moment.Moment) => void,
  // onTypeChange: PropTypes.(type: string) => void,
  value: PropTypes.any,
  validRange: PropTypes.array,
  headerRender: PropTypes.func
};

export default defineComponent({
  props: initDefaultProps(HeaderProps, {
    yearSelectOffset: 10,
    yearSelectTotal: 20
  }),
  setup($props, {emit}) {
    const getYearSelectElement = (prefixCls, year) => {
      const {yearSelectOffset, yearSelectTotal, locale = {}, fullscreen, validRange} = $props;
      let start = year - yearSelectOffset;
      let end = start + yearSelectTotal;
      if (validRange) {
        start = validRange[0].get('year');
        end = validRange[1].get('year') + 1;
      }
      const suffix = locale.year === '年' ? '年' : '';

      const options = [];
      for (let index = start; index < end; index++) {
        options.push(<Option key={`${index}`}>{index + suffix}</Option>);
      }
      return (
          <Select
              size={fullscreen ? 'default' : 'small'}
              dropdownMatchSelectWidth={false}
              class={`${prefixCls}-year-select`}
              onChange={onYearChange}
              value={String(year)}
              getPopupContainer={() => getCalenderHeaderNode()}
          >
            {options}
          </Select>
      );
    };
    const getMonthSelectElement = (prefixCls, month, months) => {
      const {fullscreen, validRange, value} = $props;
      const options = [];
      let start = 0;
      let end = 12;
      if (validRange) {
        const [rangeStart, rangeEnd] = validRange;
        const currentYear = value.get('year');
        if (rangeEnd.get('year') === currentYear) {
          end = rangeEnd.get('month') + 1;
        }
        if (rangeStart.get('year') === currentYear) {
          start = rangeStart.get('month');
        }
      }
      for (let index = start; index < end; index++) {
        options.push(<Option key={`${index}`}>{months[index]}</Option>);
      }

      return (
          <Select
              size={fullscreen ? 'default' : 'small'}
              dropdownMatchSelectWidth={false}
              class={`${prefixCls}-month-select`}
              value={String(month)}
              onChange={onMonthChange}
              getPopupContainer={() => getCalenderHeaderNode()}
          >
            {options}
          </Select>
      );
    };
    const onYearChange = (year) => {
      const {value, validRange} = $props;
      const newValue = value.clone();
      newValue.year(parseInt(year, 10));
      // switch the month so that it remains within range when year changes
      if (validRange) {
        const [start, end] = validRange;
        const newYear = newValue.get('year');
        const newMonth = newValue.get('month');
        if (newYear === end.get('year') && newMonth > end.get('month')) {
          newValue.month(end.get('month'));
        }
        if (newYear === start.get('year') && newMonth < start.get('month')) {
          newValue.month(start.get('month'));
        }
      }
      emit('valueChange', newValue);
    };
    const onMonthChange = (month) => {
      const newValue = $props.value.clone();
      newValue.month(parseInt(month, 10));
      emit('valueChange', newValue);
    };
    const onInternalTypeChange = (e) => {
      onTypeChange(e.target.value);
    };
    const onTypeChange = (val) => {
      emit('typeChange', val);
    };
    const {saveRef, getRef} = useRefs();
    const getCalenderHeaderNode = () => {
      return getRef('calenderHeaderNode');
    };
    const getMonthYearSelections = (getPrefixCls) => {
      const {prefixCls: customizePrefixCls, type, value} = $props;

      const prefixCls = getPrefixCls('fullcalendar', customizePrefixCls);
      const yearReactNode = getYearSelectElement(prefixCls, value.year());
      const monthReactNode =
          type === 'month'
              ? getMonthSelectElement(prefixCls, value.month(), getMonthsLocale(value))
              : null;
      return {
        yearReactNode,
        monthReactNode
      };
    };
    const getTypeSwitch = () => {
      const {locale = {}, type, fullscreen} = $props;
      const size = fullscreen ? 'default' : 'small';
      return (
          <Group onChange={onInternalTypeChange} value={type} size={size}>
            <Button value="month">{locale.month}</Button>
            <Button value="year">{locale.year}</Button>
          </Group>
      );
    };
    const onValueChange = () => {
      emit('valueChange', ...arguments);
    };
    const headerRenderCustom = (headerRender) => {
      const {type, value} = $props;
      return headerRender({
        value,
        type: type || 'month',
        onChange: onValueChange,
        onTypeChange
      });
    };

    return {
      configProvider: useConfigProvider(),
      getYearSelectElement,
      getMonthSelectElement,
      onYearChange,
      onMonthChange,
      onInternalTypeChange,
      onTypeChange,
      getCalenderHeaderNode,
      getMonthYearSelections,
      getTypeSwitch,
      onValueChange,
      headerRenderCustom,
      saveRef
    };
  },
  render(ctx) {
    const {prefixCls: customizePrefixCls, headerRender} = this;
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('fullcalendar', customizePrefixCls);
    const typeSwitch = this.getTypeSwitch();
    const {yearReactNode, monthReactNode} = this.getMonthYearSelections(getPrefixCls);
    return headerRender ? (
        this.headerRenderCustom(headerRender)
    ) : (
        <div class={`${prefixCls}-header`} ref={this.saveRef('calenderHeaderNode')}>
          {yearReactNode}
          {monthReactNode}
          {typeSwitch}
        </div>
    );
  }
}) as any;