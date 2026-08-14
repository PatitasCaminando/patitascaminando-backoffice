import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const sesionFalsa = {
    accessToken: 'token-de-prueba',
    refreshToken: 'refresh-de-prueba',
    tokenType: 'Bearer',
    expiresIn: 3600,
    expiresAt: null,
    user: { id: 'u1', email: 'admin@patitas.com' }
  };

  beforeEach(() => {
    localStorage.clear();
    apiSpy = jasmine.createSpyObj<ApiService>('ApiService', ['login', 'me']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiSpy }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('no debería tener usuario al iniciar', () => {
    expect(service.user()).toBeNull();
  });

  it('token debería ser null cuando no hay sesión guardada', () => {
    expect(service.token).toBeNull();
  });

  describe('login', () => {
    it('debería llamar a la API con las credenciales recibidas', (done) => {
      apiSpy.login.and.returnValue(of(sesionFalsa) as any);

      service.login('admin@patitas.com', 'clave123').subscribe(() => {
        expect(apiSpy.login).toHaveBeenCalled();
        done();
      });
    });

    it('debería guardar los tokens de la sesión en localStorage', (done) => {
      apiSpy.login.and.returnValue(of(sesionFalsa) as any);

      service.login('admin@patitas.com', 'clave123').subscribe(() => {
        expect(localStorage.getItem('pc_access_token')).toBe('token-de-prueba');
        expect(localStorage.getItem('pc_refresh_token')).toBe('refresh-de-prueba');
        expect(service.token).toBe('token-de-prueba');
        done();
      });
    });

    it('debería guardar la sesión completa en localStorage', (done) => {
      apiSpy.login.and.returnValue(of(sesionFalsa) as any);

      service.login('admin@patitas.com', 'clave123').subscribe(() => {
        const guardada = localStorage.getItem('pc_session');
        expect(guardada).toBeTruthy();
        expect(JSON.parse(guardada!).accessToken).toBe('token-de-prueba');
        done();
      });
    });

    it('no debería guardar nada si la API devuelve error', (done) => {
      apiSpy.login.and.returnValue(throwError(() => ({ status: 401 })));

      service.login('malo@patitas.com', 'incorrecta').subscribe({
        error: () => {
          expect(localStorage.getItem('pc_access_token')).toBeNull();
          expect(localStorage.getItem('pc_session')).toBeNull();
          done();
        }
      });
    });
  });

  describe('loadMe', () => {
    it('debería guardar el usuario devuelto por la API', (done) => {
      const usuario = {
        id: 'u1',
        email: 'admin@patitas.com',
        profile: { firstNames: 'Ana', lastNames: 'Ruiz', phone: null },
        roles: [{ key: 'admin', name: 'Administrador', description: null, isInternal: true }],
        permissions: []
      };
      apiSpy.me.and.returnValue(of(usuario) as any);

      service.loadMe().subscribe(() => {
        expect(service.user()?.email).toBe('admin@patitas.com');
        done();
      });
    });
  });

  describe('hasRole', () => {
    it('debería devolver false si no hay usuario autenticado', () => {
      expect(service.hasRole('admin')).toBeFalse();
    });

    it('debería distinguir entre roles del usuario autenticado', (done) => {
      const usuario = {
        id: 'u2',
        email: 'operador@patitas.com',
        profile: null,
        roles: [{ key: 'operator', name: 'Operador', description: null, isInternal: true }],
        permissions: []
      };
      apiSpy.me.and.returnValue(of(usuario) as any);

      service.loadMe().subscribe(() => {
        expect(service.hasRole('operator')).toBeTrue();
        expect(service.hasRole('admin')).toBeFalse();
        done();
      });
    });
  });

  describe('updateLocalProfile', () => {
    it('no debería hacer nada si no hay usuario cargado', () => {
      service.updateLocalProfile({ firstNames: 'Ana', lastNames: 'Ruiz', phone: '099' });
      expect(service.user()).toBeNull();
    });
  });
});