import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GptSetup from '../../../components/Settings/GPTSetup/gpt-setup.tsx';
import * as utility from '../../../components/Utilities/utility-functions';

// stub out window.alert
globalThis.alert = vi.fn();

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

describe('GptSetup Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders defaults when there are no saved settings', () => {
    renderWithTheme(<GptSetup />);
    const apiKeyInput = screen.getByLabelText('API Key', { selector: 'input' }) as HTMLInputElement;
    expect(apiKeyInput.value).toBe('');
    expect(apiKeyInput.getAttribute('type')).toBe('password');

    const modelInput = screen.getByLabelText(
      'Model (e.g., gpt-4, gpt-o4-mini)',
      { selector: 'input' }
    ) as HTMLInputElement;
    expect(modelInput.value).toBe('gpt-4o-mini');

    const maxTokensInput = screen.getByLabelText('Max Tokens', { selector: 'input' }) as HTMLInputElement;
    expect(maxTokensInput.value).toBe('1000');
  });

  it('loads and applies saved settings when decrypt succeeds', async () => {
    const settings = {
      apiKey: 'my-key',
      model: 'my-model',
      max_tokens: 250,
    };
  
    localStorage.setItem('gpt_settings', 'enc');
  
    const decryptSpy = vi
      .spyOn(utility, 'decrypt')
      .mockResolvedValueOnce(JSON.stringify(settings));
  
    renderWithTheme(<GptSetup />);
  
    // This waitFor ensures React finishes state updates AND Istanbul sees them
    await waitFor(() => {
      const apiKeyInput = screen.getByLabelText('API Key', { selector: 'input' }) as HTMLInputElement;
      const modelInput = screen.getByLabelText('Model (e.g., gpt-4, gpt-o4-mini)', { selector: 'input' }) as HTMLInputElement;
      const maxTokensInput = screen.getByLabelText('Max Tokens', { selector: 'input' }) as HTMLInputElement;
  
      // These reads from updated state force Istanbul to mark the lines
      expect(apiKeyInput.value).to.equal('my-key');
      expect(modelInput.value).to.equal('my-model');
      expect(maxTokensInput.value).to.equal('250');
    });
  
    decryptSpy.mockRestore();
  });

  it('applies fallback defaults when fields are missing', async () => {
    const partialSettings = {
      // missing apiKey
      model: undefined,
      // missing max_tokens
    };
  
    localStorage.setItem('gpt_settings', 'enc');
  
    const decryptSpy = vi
      .spyOn(utility, 'decrypt')
      .mockResolvedValueOnce(JSON.stringify(partialSettings));
  
    renderWithTheme(<GptSetup />);
  
    await waitFor(() => {
      const apiKeyInput = screen.getByLabelText('API Key', { selector: 'input' }) as HTMLInputElement;
      const modelInput = screen.getByLabelText('Model (e.g., gpt-4, gpt-o4-mini)', { selector: 'input' }) as HTMLInputElement;
      const maxTokensInput = screen.getByLabelText('Max Tokens', { selector: 'input' }) as HTMLInputElement;
  
      expect(apiKeyInput.value).to.equal('');          // fallback ""
      expect(modelInput.value).to.equal('gpt-4');      // fallback
      expect(maxTokensInput.value).to.equal('100');    // fallback
    });
  
    decryptSpy.mockRestore();
  });

  it('logs parse errors and leaves defaults when decrypted JSON is bad', async () => {
    localStorage.setItem('gpt_settings', 'enc');
    const decryptSpy = vi.spyOn(utility, 'decrypt').mockResolvedValue('not-json');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithTheme(<GptSetup />);

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to parse decrypted GPT settings:',
        expect.any(SyntaxError)
      )
    );

    // default still in place
    const apiKeyInput = screen.getByLabelText('API Key', { selector: 'input' }) as HTMLInputElement;
    expect(apiKeyInput.value).toBe('');

    decryptSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('logs decryption errors and leaves defaults when decrypt rejects', async () => {
    localStorage.setItem('gpt_settings', 'enc');
    const error = new Error('fail');
    const decryptSpy = vi.spyOn(utility, 'decrypt').mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithTheme(<GptSetup />);

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith('Failed to decrypt GPT settings:', error)
    );

    const apiKeyInput = screen.getByLabelText('API Key', { selector: 'input' }) as HTMLInputElement;
    expect(apiKeyInput.value).toBe('');

    decryptSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('toggles API key visibility when clicking the visibility icon', () => {
    renderWithTheme(<GptSetup />);
    const apiKeyInput = screen.getByLabelText('API Key', { selector: 'input' }) as HTMLInputElement;

    // starts hidden
    expect(apiKeyInput.getAttribute('type')).toBe('password');

    // the little icon‐button has no accessible name, so it shows up as a button with name=""
    const toggleButton = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleButton);

    // now it should be visible
    expect(apiKeyInput.getAttribute('type')).toBe('text');

    // click again to hide
    fireEvent.click(toggleButton);
    expect(apiKeyInput.getAttribute('type')).toBe('password');
  });

  it('saves settings to localStorage and alerts on success', async () => {
    const encryptSpy = vi.spyOn(utility, 'encrypt').mockResolvedValue('encrypted-payload');

    renderWithTheme(<GptSetup />);

    fireEvent.change(screen.getByLabelText('API Key', { selector: 'input' }), {
      target: { value: 'new-api-key' },
    });
    fireEvent.change(
      screen.getByLabelText('Model (e.g., gpt-4, gpt-o4-mini)', {
        selector: 'input',
      }),
      { target: { value: 'new-model' } }
    );
    fireEvent.change(screen.getByLabelText('Max Tokens', { selector: 'input' }), {
      target: { value: '321' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save api settings/i }));

    await waitFor(() =>
      expect(encryptSpy).toHaveBeenCalledWith(
        JSON.stringify({
          apiKey: 'new-api-key',
          model: 'new-model',
          max_tokens: 321
        })
      )
    );

    expect(localStorage.getItem('gpt_settings')).toBe('encrypted-payload');
    expect(globalThis.alert).toHaveBeenCalledWith('Settings saved!');

    encryptSpy.mockRestore();
  });
});