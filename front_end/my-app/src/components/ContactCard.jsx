
export default function CardHeader({name, imgSrc, desc}) {
    const phoneNumber = desc.phone;
    const email = desc.email
 
    return(
        <div className="contact-card">
            <h2>{name}</h2>
            <img src={imgSrc}/>
          <p>Phone: {phoneNumber}</p>
          <p>Email: {email}</p> 
        
        </div>
    )};
