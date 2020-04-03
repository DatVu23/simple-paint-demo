import styled from "styled-components";

export const Input = styled.input`
  font-family: inherit;
  width: 100%;
  border: 0;
  border-bottom: 2px solid #9b9b9b;
  outline: 0;
  font-size: 1.3rem;
  padding: 7px 0;
  background: transparent;
  transition: border-color 0.2s;

  &:focus {
    ~ label {
      position: absolute;
      top: 0;
      display: block;
      transition: 0.2s;
      font-size: 1rem;
      color: rgb(25, 118, 210);
      font-weight: 700;
      placeholder: 0;
    }
    padding-bottom: 6px;
    font-weight: 700;
    border-width: 3px;
    border-image: linear-gradient(to right, rgb(25, 118, 210), #38ef7d);
    border-image-slice: 1;

    :placeholder-shown ~ label {
      font-size: 1.3rem;
      cursor: text;
      top: 20px;
    }
  }

  ::placeholder {
    color: transparent;
  }

  &:required,
  &:invalid {
    box-shadow: none;
  }
`;
