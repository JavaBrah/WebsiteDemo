export default function CardBody({ desc }) {
  // If you prefer just a paragraph, swap this <ul> for <p>
  return (
    <ul className="card-details">
      {desc.map((d, idx) => (
        <li key={idx}>Phone {d.phone}</li>
      ))}
    </ul>
  );
}