import { useEffect, useMemo, useState, ChangeEvent } from 'react';

type ValidationFunction = (value: any) => boolean;

type FormValidations<T> = {
  [K in keyof T]?: [ValidationFunction, string];
};

type FormValidationState = {
  [key: string]: string | null;
};

export const useForm = <T extends Record<string, any>>(
  initialForm: T,
  formValidations: FormValidations<T> = {}
) => {
  const [formState, setFormState] = useState<T>(initialForm);
  const [formValidation, setFormValidation] = useState<FormValidationState>({});

  useEffect(() => {
    createValidators();
  }, [formState]);

  useEffect(() => {
    setFormState(initialForm);
  }, [initialForm]);

  const isFormValid = useMemo(() => {
    for (const key of Object.keys(formValidation)) {
      if (formValidation[key] !== null) return false;
    }
    return true;
  }, [formValidation]);

  const onInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const onResetForm = () => {
    setFormState(initialForm);
  };

  const createValidators = () => {
    const formCheckedValues: FormValidationState = {};

    for (const formField of Object.keys(formValidations) as (keyof T)[]) {
      const [fn, errorMessage] = formValidations[formField]!;
      const value = formState[formField];
      formCheckedValues[`${String(formField)}Valid`] = fn(value) ? null : errorMessage;
    }

    setFormValidation(formCheckedValues);
  };

  return {
    ...formState,
    formState,
    onInputChange,
    onResetForm,
    ...formValidation,
    isFormValid,
  };
};
