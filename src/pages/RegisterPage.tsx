import { useState } from 'react';
import { Button } from '../components/atoms/Button';
import { TextInput } from '../components/atoms/TextInput';

interface RegisterPageProps {
  autenticando: boolean;
  erroAutenticacao: string;
  aoRegistrar: (dados: RegistroDados) => Promise<void>;
  aoVoltarLogin: () => void;
}

export interface RegistroDados {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  endereco: string;
}

export const RegisterPage = ({
  autenticando,
  erroAutenticacao,
  aoRegistrar,
  aoVoltarLogin
}: RegisterPageProps) => {
  const [formData, setFormData] = useState<RegistroDados>({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    endereco: ''
  });
  const [erroLocal, setErroLocal] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const handleChange = (field: keyof RegistroDados, valor: string) => {
    setFormData(prev => ({ ...prev, [field]: valor }));
  };

  const validarFormulario = (): boolean => {
    if (!formData.nome.trim()) {
      setErroLocal('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setErroLocal('E-mail é obrigatório');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErroLocal('E-mail inválido');
      return false;
    }
    if (!formData.senha.trim()) {
      setErroLocal('Senha é obrigatória');
      return false;
    }
    if (formData.senha.length < 6) {
      setErroLocal('Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (!formData.telefone.trim()) {
      setErroLocal('Telefone é obrigatório');
      return false;
    }
    if (!formData.endereco.trim()) {
      setErroLocal('Endereço é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setErroLocal('');
    
    if (!validarFormulario()) {
      return;
    }

    await aoRegistrar(formData);
  };

  return (
    <section className="pagina-login" id="register-section">
      <div className="pagina-login__card">
        <button 
          type="button" 
          className="back-link" 
          onClick={aoVoltarLogin}
          aria-label="Voltar para login"
        >
          ← Voltar para login
        </button>

        <p className="kicker">Criar nova conta</p>
        <h2>Cadastro de usuário</h2>
        <p className="pagina-login__texto">
          Preencha os dados abaixo para criar sua conta e começar a usar a Nexora Tech.
        </p>

        <div className="register-form-grid">
          <div className="register-form-row">
            <TextInput
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
            />
          </div>

          <div className="register-form-row">
            <TextInput
              name="email"
              type="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="register-form-row">
            <div className="password-field">
              <TextInput
                name="senha"
                type={senhaVisivel ? "text" : "password"}
                placeholder="Senha (mínimo 6 caracteres)"
                value={formData.senha}
                onChange={(e) => handleChange('senha', e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setSenhaVisivel(!senhaVisivel)}
                aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
              >
                {senhaVisivel ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="register-form-row">
            <TextInput
              name="telefone"
              placeholder="Telefone (11) 99999-9999"
              value={formData.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
            />
          </div>

          <div className="register-form-row">
            <TextInput
              name="endereco"
              placeholder="Endereço (rua, número, cidade)"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
            />
          </div>
        </div>

        <div className="register-actions">
          <Button
            type="button"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={autenticando}
            fullWidth
          >
            {autenticando ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </div>

        {erroLocal ? <p className="auth-error">{erroLocal}</p> : null}
        {erroAutenticacao ? <p className="auth-error">{erroAutenticacao}</p> : null}

        <div className="register-footer">
          <p>
            Já tem conta? 
            <button 
              type="button" 
              className="link-button"
              onClick={aoVoltarLogin}
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
