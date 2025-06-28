import NavBar from "../components/NavBar";
import CardHeader from '../components/CardHeader';
import contacts from '../data/teamContacts.js';

function Contact(){
    return (
        <div>
            <NavBar/>
            <h1>Contact Info</h1>
            <div>
                {contacts.map(profile => (
                    <CardHeader key={profile.id} {...profile} />
                ))}
            </div>
        </div>
    );
}
export default Contact;