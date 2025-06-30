export default function CardBody({ desc }) {
    return (
        <ul className="card-details">
            {desc.map((d, idx) => (
        <li key={idx}>Phone {d.phone}</li>
      ))}
    </ul>
  );
};
