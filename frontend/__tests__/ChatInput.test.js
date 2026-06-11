import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from '../components/ChatInput';

describe('Frontend Component Tests - Member #1', () => {

  // 1. Success State & Prop Passing Test
  test('renders component correctly and displays placeholder', () => {
    render(<ChatInput onSubmit={jest.fn()} />);
    const inputElement = screen.getByPlaceholderText(/type your question/i);
    expect(inputElement).toBeInTheDocument();
  });

  // 2. User Interaction Test (Typing)
  test('allows users to type and updates input field value', () => {
    render(<ChatInput onSubmit={jest.fn()} />);
    const inputElement = screen.getByPlaceholderText(/type your question/i);

    fireEvent.change(inputElement, { target: { value: 'Hello AI Workspace' } });
    expect(inputElement.value).toBe('Hello AI Workspace');
  });

  // 3. User Interaction Test (Form Submission Success)
  test('calls onSubmit handler with input data when send button is clicked', () => {
    const mockSubmit = jest.fn();
    render(<ChatInput onSubmit={mockSubmit} />);
    
    const inputElement = screen.getByPlaceholderText(/type your question/i);
    const buttonElement = screen.getByRole('button', { name: /send/i });

    fireEvent.change(inputElement, { target: { value: 'Testing Submission' } });
    fireEvent.click(buttonElement);

    expect(mockSubmit).toHaveBeenCalledWith('Testing Submission');
    expect(inputElement.value).toBe(''); 
  });

  // 4. Error State Validation Test
  test('displays validation error if user tries to submit an empty field', () => {
    render(<ChatInput onSubmit={jest.fn()} />);
    const buttonElement = screen.getByRole('button', { name: /send/i });

    // Submit without typing anything to trigger error state
    fireEvent.click(buttonElement);

    const errorAlert = screen.getByText(/this field cannot be empty/i); 
    expect(errorAlert).toBeInTheDocument();
  });
});