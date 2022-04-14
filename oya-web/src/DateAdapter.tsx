import AdapterJalali from '@date-io/date-fns-jalali';
import AdapterBase from '@date-io/date-fns';

class Adapter extends AdapterJalali {
  constructor(args?: any) {
    super(args);
    this.getWeekdays = () => ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  }
}

const localeUtils = new Adapter();
const UTCUtils = new AdapterBase();

export { Adapter, localeUtils, UTCUtils };
