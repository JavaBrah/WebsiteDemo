import NavBar from "../components/NavBar";
import ContactCard from "../components/ContactCard.jsx"
import contacts from '../data/teamContacts.js';

function Contact(){
    return (
        <div>
            <NavBar/>
            <h1>Contact Info</h1>
            <div>
                {contacts.map(profile => (
                    <ContactCard key={profile.id} {...profile} />
                ))}
            </div>
        </div>
    );
}
export default Contact;