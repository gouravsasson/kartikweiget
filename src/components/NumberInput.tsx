// PhoneInput.js
import React, { useState } from "react";
import IntlTelInput from "intl-tel-input/react";
import "intl-tel-input/build/css/intlTelInput.css";

const PhoneInput = () => {
  const [number, setNumber] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  return (
    <div>
      <IntlTelInput
        initialValue={number}
        onChangeNumber={setNumber}
        onChangeValidity={setIsValid}
        initOptions={{
          initialCountry: "us",
          //   loadUtils: () =>
          //     import(
          //       "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
          //     ),
        }}
      />
    </div>
  );
};

export default PhoneInput;
