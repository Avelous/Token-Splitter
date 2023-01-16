import React from "react";
import { Typography } from "antd";

const { Title, Text } = Typography;

// displays a page header

export default function Header({ link, title, subTitle, githubLink, ...props }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "1.2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "start" }}>
        <a href={link} target="_blank" rel="noopener noreferrer">
          <Title level={4} style={{ margin: "0 0.5rem 0 0" }}>
            {title}
          </Title>
        </a>
        <a href={githubLink} target="_blank">
          <Text type="secondary" style={{ textAlign: "left", marginLeft: 30 }}>
            {subTitle}
          </Text>
        </a>
      </div>
      {props.children}
    </div>
  );
}

Header.defaultProps = {
  link: "https://token-splitter.surge.sh",
  title: "➗ Token-Splitter",
  subTitle: "code",
  githubLink: "https://github.com/Avelous/Token-Splitter",
};
