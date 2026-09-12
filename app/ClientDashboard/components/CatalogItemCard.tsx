"use client";

import { useRef, useState } from "react";

type CatalogItem = {
  name: string;
  provider: string;
  price: number;
};

type CatalogItemCardProps = {
  item: CatalogItem;
  imageUrl: string;
  fallbackImage: string;
  onAdd: (item: CatalogItem) => void;
};

export function CatalogItemCard({ item, imageUrl, fallbackImage, onAdd }: CatalogItemCardProps) {
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);

  function handleAdd() {
    onAdd(item);
    setAdded(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 900);
  }

  return (
    <article className="item-card">
      <div className="item-image">
        {/* The images are local/remote catalog content, so a plain image avoids Next image host configuration. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl || fallbackImage} alt={item.name} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.src = fallbackImage; }} />
      </div>
      <div className="item-body">
        <div className="item-name">{item.name}</div>
        <div className="item-provider">{item.provider}</div>
        <div className="item-footer"><span className="item-price">Rs. {item.price}</span><button className={"add-btn" + (added ? " added" : "")} type="button" onClick={handleAdd}>{added ? "Added ✓" : "+ Add to Cart"}</button></div>
      </div>
    </article>
  );
}
