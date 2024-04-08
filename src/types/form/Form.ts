import type {FormValue} from '@components/Form/types';
import type * as DatabaseCommon from '@src/types/onyx/DatabaseCommon';

type BaseForm = {
  /** Controls the loading state of the form */
  isLoading?: boolean;

  /** Server side errors keyed by microtime */
  errors?: DatabaseCommon.Errors | null;

  /** Field-specific server side errors keyed by microtime */
  errorFields?: DatabaseCommon.ErrorFields | null;
};

type FormValues = Record<string, FormValue>;
type Form<TFormValues extends FormValues = FormValues> = TFormValues & BaseForm;

export default Form;
export type {BaseForm};
