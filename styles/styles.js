import { StyleSheet } from 'react-native';

// Define UCT Colors
const UCT_BLUE = '#0033A0'; // Replace with the official UCT blue color
const UCT_LIGHT_BLUE = '#8AB4F8'; // Lighter blue for accents
const UCT_GRAY = '#F0F4F7'; // Light gray background
const DARKER_BLUE = '#002080'; // Darker blue for register link

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: UCT_GRAY,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: UCT_BLUE,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 12,
    color: UCT_BLUE,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 4,
  },
  button: {
    width: '80%',
    marginVertical: 10,
    backgroundColor: UCT_BLUE,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    padding: 10,
  },
  card: {
    width: '90%',
    padding: 16,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: UCT_BLUE,
  },
  cardContent: {
    fontSize: 16,
    color: '#333',
  },
  link: {
    color: DARKER_BLUE, // Darker blue color for the Register link
    fontWeight: 'bold',
  },
  review: {
    fontSize: 14,
    color: '#333',
  },
  status: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  qrCode: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  roleSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  roleButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  selectedRoleButton: {
    backgroundColor: '#007BFF',
  },
  roleButtonText: {
    color: '#333',
  },
  logo: {
    width: 300,  // Smaller width
    height: 300, // Smaller height
    resizeMode: 'contain',  // Keep the image aspect ratio
    marginBottom: 10,  // Space below the logo
  },
  
});

export default styles;
