import { EvaluationFunction, simplifyNodeUnit } from '..'
import { ASTNode, EvaluatedNode } from '../AST/types'
import { PublicodesError } from '../error'
import { registerEvaluationFunction } from '../evaluationFunctions'
import { mergeAllMissing } from '../evaluationUtils'
import parse from '../parse'
import { serializeUnit } from '../units'

export type InférieurNode = {
	explanation: {
		'inférieur': ASTNode
		valeur: ASTNode
	}
	nodeKind: 'inférieur'
}

function floorWithPrecision(n: number, fractionDigits: number) {
	const v = (
		Math.floor((n + Number.EPSILON) * 10 ** fractionDigits) /
		10 ** fractionDigits
	)
	return v;
}

const evaluate: EvaluationFunction<'inférieur'> = function (node) {
	// We need to simplify the node unit to correctly round values containing
	// percentages units, see #1358
	const valeur = simplifyNodeUnit(this.evaluateNode(node.explanation.valeur))
	const nodeValue = valeur.nodeValue
	let arrondiinf = node.explanation['inférieur']
	if (nodeValue !== false) {
		arrondiinf = this.evaluateNode(arrondiinf)

		if (
			typeof (arrondiinf as EvaluatedNode).nodeValue === 'number' &&
			!serializeUnit((arrondiinf as EvaluatedNode).unit)?.match(/décimales?/)
		) {
			throw new PublicodesError(
				'EvaluationError',
				`L'unité ${serializeUnit(
					(arrondiinf as EvaluatedNode).unit,
				)} de l'arrondi est inconnu. Vous devez utiliser l'unité “décimales”`,
				{ dottedName: this.cache._meta.evaluationRuleStack[0] },
			)
		}
	}

	const result = {
		...node,
		nodeValue:
			typeof valeur.nodeValue !== 'number' || !('nodeValue' in arrondiinf) ?
				valeur.nodeValue
			: typeof arrondiinf.nodeValue === 'number' ?
				floorWithPrecision(valeur.nodeValue, arrondiinf.nodeValue)
			: arrondiinf.nodeValue === true ? floorWithPrecision(valeur.nodeValue, 0)
			: arrondiinf.nodeValue === undefined ? undefined
			: valeur.nodeValue,
		explanation: { valeur: valeur, 'inférieur': arrondiinf },
		missingVariables: mergeAllMissing([valeur, arrondiinf]),
		unit: valeur.unit,
	}
	return result;
}

export default function parseInférieur(v, context) {
	const explanation = {
		valeur: parse(v.valeur, context),
		'inférieur': parse(v['inférieur'], context),
	}
	return {
		explanation,
		nodeKind: parseInférieur.nom,
	}
}

parseInférieur.nom = 'inférieur' as const

registerEvaluationFunction(parseInférieur.nom, evaluate)
