import * as React from "react";
import { useCallback, useRef } from "react";
import { Field, Form } from "react-final-form";
import { canSubmit, processError, validate } from "../../technical/form";
import styled from "styled-components";
import { Card } from "../../components/Card";
import { Button as BaseButton } from "../../components/Button";
import * as Input from "../../components/input";
import { Checkbox } from "../../components/input/Checkbox";
import { useContent } from "../../technical/contentful/content";
import { TextKey } from "../../technical/contentful/text";
import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";

const Container = styled.div`
  max-width: 1024px;
  margin: auto;
`;

const HTMLForm = styled.form`
  display: flex;
  flex-direction: column;
  pointer-events: all;
`;

const HiddenInput = styled.input`
  display: none;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 24px;
`;

const Label = styled(Input.Label)`
  margin-left: 8px;
`;

const Button = styled(BaseButton)`
  margin-top: 24px;
`;

interface Values {
  EMAIL: string;
  OPT_IN: boolean;
  postal: string;
}

interface Props {
  onSubmitPostalCode: (postal: string) => void;
}

export const EventForm = ({ onSubmitPostalCode }: Props) => {
  const { texts } = useContent();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(
    (values: Values) => {
      onSubmitPostalCode(values.postal);
      const formData = new FormData(formRef.current);
      formData.set("OPT_IN", values.OPT_IN ? "1" : "");
      return fetch(process.env.SEND_IN_BLUE_FORM, {
        method: "POST",
        body: formData,
        mode: "no-cors",
      });
    },
    [onSubmitPostalCode]
  );

  return (
    <Container>
      <Card className="px-4 sm:px-12 py-12">
        <Form
          id="sib-form"
          onSubmit={handleSubmit}
          validate={validate({
            EMAIL: {
              email: {
                message: "n'est pas valide.",
              },
              presence: {
                message: "est requis.",
              },
            },
            postal: {
              format: {
                pattern: /^(?:(?:(?:0[1-9]|[1-8]\d|9[0-4])(?:\d{3})?)|97[1-8]|98[4-9]|‌​‌​2[abAB])$/,
                message: "ne semble pas être un code postal valide.",
              },
              length: {
                minimum: 3,
                message: "^Le code postal doit faire plus de 3 caractères.",
              },
            },
          })}
        >
          {formProps => (
            <HTMLForm ref={formRef} onSubmit={formProps.handleSubmit}>
              <Field id="EMAIL" name="EMAIL" type="text">
                {({ input, meta }) => {
                  const error = processError(meta);

                  return (
                    <Input.Errored error={error}>
                      <Input.Text
                        {...input}
                        disabled={formProps.submitting}
                        error={!!error}
                        placeholder={documentToPlainTextString(
                          texts[TextKey.MAP_FORM_EMAIL].document
                        )}
                      />
                    </Input.Errored>
                  );
                }}
              </Field>
              <InputContainer>
                <Field name="postal" type="text">
                  {({ input, meta }) => {
                    const error = processError(meta);

                    return (
                      <Input.Errored error={error}>
                        <Input.Text
                          {...input}
                          disabled={formProps.submitting}
                          error={!!error}
                          placeholder={documentToPlainTextString(
                            texts[TextKey.MAP_FORM_POSTAL].document
                          )}
                        />
                      </Input.Errored>
                    );
                  }}
                </Field>
              </InputContainer>

              <Field id="OPT_IN" name="OPT_IN" type="checkbox">
                {({ input, meta }) => {
                  const error = processError(meta);

                  return (
                    <Input.Errored error={error}>
                      <InputContainer>
                        <Checkbox
                          {...input}
                          disabled={formProps.submitting}
                          id="OPT_IN"
                        />
                        <Label htmlFor="OPT_IN">
                          {documentToPlainTextString(
                            texts[TextKey.MAP_FORM_OTIN].document
                          )}
                        </Label>
                      </InputContainer>
                    </Input.Errored>
                  );
                }}
              </Field>
              <HiddenInput type="text" name="email_address_check" value="" />
              <HiddenInput type="hidden" name="locale" value="fr" />
              <HiddenInput type="hidden" name="html_type" value="simple" />
              <Button
                disabled={!canSubmit(formProps)}
                loading={formProps.submitting}
              >
                {documentToPlainTextString(
                  texts[TextKey.MAP_FORM_CTA].document
                )}
              </Button>
            </HTMLForm>
          )}
        </Form>
      </Card>
    </Container>
  );
};