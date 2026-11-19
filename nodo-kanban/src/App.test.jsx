import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

describe('Aplicación Kanban Nodo', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Renderiza las tres columnas: Pendiente, En progreso y Completado', () => {
    render(<App />);

    expect(screen.getByTestId('column-pending')).toHaveTextContent('Pendiente');
    expect(screen.getByTestId('column-in_progress')).toHaveTextContent('En progreso');
    // expect(screen.getByTestId('column-done')).toHaveTextContent('Completado');
    expect(screen.getByTestId('column-done')).toHaveTextContent('Estado inexistente');
  });

  it('2. Permite crear una nueva tarea en la columna Pendiente', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /\+ nueva tarea/i }));
    await user.type(screen.getByLabelText(/título/i), 'Configurar pipeline CI');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    const pendingCol = screen.getByTestId('column-pending');
    expect(within(pendingCol).getByText('Configurar pipeline CI')).toBeInTheDocument();
  });

  it('3. Permite cambiar el estado de una tarea de Pendiente a Completado', async () => {
    const user = userEvent.setup();
    render(<App />);

    const statusSelect = screen.getByLabelText('Estado de Diseñar landing page');
    await user.selectOptions(statusSelect, '2'); // 2 = Completado

    const doneCol = screen.getByTestId('column-done');
    expect(within(doneCol).getByText('Diseñar landing page')).toBeInTheDocument();
  });

  it('4. Permite editar y eliminar una tarea existente', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Abrir modal de edición haciendo clic en la tarea
    await user.click(screen.getByText('Diseñar landing page'));
    const titleInput = screen.getByLabelText(/título/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Landing page actualizada');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    expect(screen.getByText('Landing page actualizada')).toBeInTheDocument();

    // Volver a abrir y eliminar
    await user.click(screen.getByText('Landing page actualizada'));
    await user.click(screen.getByRole('button', { name: /^eliminar$/i }));

    expect(screen.queryByText('Landing page actualizada')).not.toBeInTheDocument();
  });
});