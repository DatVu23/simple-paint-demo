import styled from "styled-components";

export const Button = styled.button`
  width: 140px;
  height: 45px;
  font-family: "Roboto", sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2.5px;
  font-weight: 500;
  color: #000;
  background-color: #fff;
  border: none;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: ${({ color }) => color || "#2ee59d"};
    box-shadow: 0px 15px 20px
      ${({ color }) => color || "rgba(46, 229, 157, 0.4)"};
    color: #fff;
    transform: translateY(-7px);
  }
`;
