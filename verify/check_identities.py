#!/usr/bin/env python3
"""Exact symbolic checks and explicitly limited scale calculations.

These checks do not solve the profile equations or verify the correction scheme.
Run with the Python interpreter recorded in environment.json.
"""
import json
import platform
import sys
from pathlib import Path
import sympy as s

checks = []


def equal(name, expression, expected=0):
    residual = s.simplify(expression - expected)
    if residual != 0:
        raise AssertionError(f'{name}: residual {residual}')
    checks.append({"name": name, "result": "exact", "value": str(s.simplify(expression))})


h, q, eta, tau = s.symbols('h q eta tau', positive=True)
A, D = s.Rational(1, 2) + h, s.Rational(1, 2) - h
lr, lz, speed = s.Rational(1, 2), D, -A
volume = 2*lr+lz
equal('core_volume_exponent', volume, s.Rational(3,2)-h)
equal('core_energy_exponent', volume+2*speed, s.Rational(1,2)-3*h)
equal('radial_dissipation_exponent', volume+2*(speed-lr), -s.Rational(1,2)-3*h)
equal('slenderness_exponent', lr-lz, h)
equal('angular_Reynolds_exponent', speed+lr, -h)
equal('axial_transport_rate_exponent', speed-lz, -1)
equal('radial_diffusion_rate_exponent', -2*lr, -1)
equal('L3_core_norm_exponent', speed+volume/3, -s.Rational(4,3)*h)
equal('L5_space_integral_exponent', 5*speed+volume, -1-6*h)
# The last two are model core scales, not applications of a regularity criterion.
exponent = s.Rational(1,2)-3*h
equal('antiderivative_of_core_dissipation', s.diff(tau**exponent/exponent,tau),
      tau**(-s.Rational(1,2)-3*h))

# Similarity coordinate equations (3.2), differentiated on a fixed-time slice.
q_eta = tau/(1-eta**2)
z_eta = eta*q_eta**D
equal('similarity_jacobian', s.diff(z_eta,eta),
      q_eta**D*(1-2*h*eta**2)/(1-eta**2))
z = s.symbols('z', real=True)
F = q-z**2*q**(2*h)
equal('implicit_q_derivative_on_similarity_surface',
      s.diff(F,q).subs(z,eta*q**D), 1-2*h*eta**2)

# Coordinate-free perturbation identity, checked on nonconstant polynomial fields.
x,y,z,t,nu = s.symbols('x y z t nu', real=True)
coords = (x,y,z)
u = s.Matrix([-t*y,t*x,0])
w = t**2*s.Matrix([y*z,-x*z,x*y])
p, pi = t*x*y*z, t*(x*x-y*y)
grad = lambda f: s.Matrix([s.diff(f,c) for c in coords])
lap = lambda v: v.applyfunc(lambda f: sum(s.diff(f,c,2) for c in coords))
adv = lambda a,b: b.jacobian(coords)*a
residual = lambda v,pressure: v.diff(t)+adv(v,v)-nu*lap(v)+grad(pressure)
expansion = w.diff(t)+adv(u,w)+adv(w,u)-nu*lap(w)+grad(pi)+adv(w,w)
for i,e in enumerate(residual(u+w,p+pi)-residual(u,p)-expansion):
    equal(f'polynomial_residual_expansion_component_{i}',e)
div = lambda v: sum(s.diff(v[i],coords[i]) for i in range(3))
curl = lambda v: s.Matrix([s.diff(v[2],y)-s.diff(v[1],z),
                          s.diff(v[0],z)-s.diff(v[2],x),
                          s.diff(v[1],x)-s.diff(v[0],y)])
potential = s.Matrix([x*y*z,x*x*z,y*y*x])
cutoff_model = x*x+y*z+t
equal('divergence_of_localized_curl',div(curl(cutoff_model*potential)))
equal('curl_product_rule_squared_norm',
      (curl(cutoff_model*potential)-cutoff_model*curl(potential)-grad(cutoff_model).cross(potential)).dot(
       curl(cutoff_model*potential)-cutoff_model*curl(potential)-grad(cutoff_model).cross(potential)))

# Isotropic and viscosity scalings, derived by the chain rule.
equal('isotropic_time_derivative_scaling_power',1+2,3)
equal('isotropic_advection_scaling_power',1+1+1,3)
equal('isotropic_viscosity_scaling_power',1+2,3)
equal('isotropic_pressure_gradient_scaling_power',2+1,3)
equal('isotropic_energy_scaling_power',2-3,-1)
equal('viscosity_spatial_scaling_power',s.Rational(1,2)-s.Rational(1,2),0)
equal('viscosity_advection_scaling_power',2*s.Rational(1,2)-s.Rational(1,2),s.Rational(1,2))
equal('viscosity_laplacian_scaling_power',1+s.Rational(1,2)-1,s.Rational(1,2))

# Algebra behind the quadratic-irrational small-divisor estimate.
k1,k2=s.symbols('k1 k2', integer=True)
small=(s.sqrt(2)-1)*k1+k2
conjugate=(-s.sqrt(2)-1)*k1+k2
equal('quadratic_conjugate_product',small*conjugate,(k2-k1)**2-2*k1**2)
shell_counts=[]
for n in range(1,11):
    count=sum(abs(i)+abs(j)==n for i in range(-n,n+1) for j in range(-n,n+1))
    equal(f'l1_lattice_shell_{n}',count,4*n)
    shell_counts.append(count)
Path('verify/environment.json').write_text(json.dumps({"python":sys.version,"executable":sys.executable,
    "sympy":s.__version__,"platform":platform.platform()},indent=2)+'\n')
print(json.dumps({"scope":"exact algebra; polynomial identity instances; core scale calculations only",
    "checks":checks,"integrability_condition":"h < 1/6 (strict); manuscript chooses 0 < h < 1/100",
    "not_checked":["existence and positivity of the profiles", "stress cone realizability",
       "uniform pulse estimates", "all-order summation", "whole-space pressure recovery",
       "full manuscript", "Lean elaboration or kernels"]},indent=2))
